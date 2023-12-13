
const orderCollection = require('../model/order')
const userCollection = require('../model/user')
const cartCollection=require('../model/cart')
const productsCollections = require ('../model/product')
const couponCollection = require('../model/coupon')
const reviewCollection = require('../model/rating&review')
const moment = require("moment")
const mongoose = require('mongoose')
const { generateInvoice } = require('../util/InvoiceGenarator')
const razorpay = require("../util/razorpay");
const crypto = require('crypto');
const  path  = require('path')

//Get check out page
async function getOrderpage(req,res){
    try{
        let user=req.session.user
        let email=req.session.email

        const users = await userCollection.findOne({ email: email });
        const userId = users._id;
        // console.log("userID",userId);
        const order = await orderCollection.findOne({
          UserId: userId,
          PaymentMethod: 'online',
          PaymentStatus: 'Pending'
        });
        // console.log("ordeer",order);
        let orderId = order ? order._id : null;
        if (orderId) {
          try {
              const orderData = await orderCollection.findById(orderId);
                  for (const orderItem of orderData.Items) {
                      const productId = orderItem.productId;
                      const quantity = orderItem.quantity;
                      let userCart = await cartCollection.findOne({ userId: userId });
                      if (!userCart) {
                          userCart = new cartCollection({
                              userId: userId,
                              products: [],
                              TotalAmount: 0,
                          });
                      }
                      const existingProduct = userCart.products.find(
                          (product) => product.productId.toString() === productId.toString()
                      );
                      if (existingProduct) {
                          existingProduct.quantity += quantity;
                      } else {
                          userCart.products.push({
                              productId: productId,
                              quantity: quantity,
                          });
                      }
                      await userCart.save();
                  }
                  await orderCollection.deleteOne({ _id: orderId });
  
          } catch (error) {
              console.error('Error processing order:', error);
              res.render("errorView/404");
          }
        }

        let TotalPrice=req.session.totalPrice
        const grandTotal=req.session.grandTotal
        const coupon = req.session.coupon
        const userAddressData = await userCollection.findOne({ email: email })
        res.render('userView/userCheckout',{title:"Checkout page",user,userAddressData,TotalPrice,grandTotal,coupon})
    }catch (error) {
        console.error("An error occurred:", error);
        // console.log("cart data note available");
        res.render("errorView/404");
    }
}

//post ckeck out page
async function postplaceOrder(req, res) {
    const email = req.session.email;
    let datas = req.body;
    // console.log("datas----------",datas);
    let couponCode=req.body.couponCode
    const Address = req.body.selectedAddress;
    const paymentMethod = req.body.selectedPayment;
    const grandTotal=req.session.grandTotal
    let amount=null
    if(grandTotal==null){
         amount = req.session.totalPrice;
    }else{
         amount = req.session.grandTotal;
    }

    try {
      const userData = await userCollection.findOne({ email: email });
      // console.log("userData..",userData);
        if (!userData) {
            console.log("cart data note available");
            res.render("errorView/404admin");
            return;
        }

        const userID = userData._id;
        const walletAmount = userData.wallet.amount
        // console.log("walletAmount...",walletAmount);
        // console.log("order time user id ",userID);
        // console.log("paymentMethod...",paymentMethod);
        // console.log("amount",amount);

        if(paymentMethod =="wallet" && walletAmount<=amount){
          res.json({ Walsuccess: true });
          return;
        }
        const cartData = await cartCollection.findOne({ userId: userID }).populate("products.productId");
        // console.log("cartData",cartData);

        if (!cartData) {
            console.log("Cart data not available");
            res.render("errorView/404admin");
            return;
        }

        const addressNew = await userCollection.findOne({
            _id:userID,
            address:{$elemMatch:{_id: new mongoose.Types.ObjectId(Address)}}
        })
        // console.log("address 0001:",addressNew); 

        if (addressNew) {
            var addressObjIndex = addressNew.address.findIndex(addr=>addr._id == Address)
          } 

        const add = {
            Name: addressNew.address[addressObjIndex].nameuser,
            Address:  addressNew.address[addressObjIndex].addressLine,
            Pincode: addressNew.address[addressObjIndex].pincode,
            City: addressNew.address[addressObjIndex].city,
            State: addressNew.address[addressObjIndex].state,
            Mobile:  addressNew.address[addressObjIndex].mobile,
        }


        
        const newOrder = new orderCollection({
            UserId: userID,
            Items: cartData.products,
            PaymentMethod: paymentMethod,
            OrderDate: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
            ExpectedDeliveryDate: new Date(
                Date.now() + 6 * 24 * 60 * 60 * 100
            ).toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
            TotalPrice: amount,
            Address: add,
        });

        const order = await newOrder.save();
        req.session.orderID = order._id;
        // console.log("Order detail", order);
        await cartCollection.findByIdAndDelete(cartData._id);

        for (const item of order.Items) {
            const productId = item.productId;
            const quantity = item.quantity;
            const product = await productsCollections.findById(productId);

            if (product) {
                const updateQuantity = product.AvailableQuantity - quantity;
                if (updateQuantity < 0) {
                    product.AvailableQuantity = 0;
                    product.Status = "Out of stock";
                } else {
                    product.AvailableQuantity = updateQuantity;
                    await product.save();
                }
            }
        }
        // const coupon = await couponCollection.findOne({ CoupenCode: couponCode });
        if(couponCode){
          userData.usedCoupons.push({
                      couponCode: couponCode,
                      // discountedAmount: discountedAmount,
                      usedDate: new Date(),
                    });
                    await userData.save();
                // console.log("userData:::",userData);
        }

        if (paymentMethod === "cod") {
            res.json({ codSuccess: true });
        }else if(paymentMethod === "online"){
            // console.log("req.session.orderID",req.session.orderID);
            const order = {
                amount: amount,
                currency: "INR",
                receipt: req.session.orderID,
              };
            //   console.log("order order",order);
              await razorpay
                .createRazorpayOrder(order)
                .then((createdOrder) => {
                //   console.log("payment response", createdOrder);
                  res.json({ createdOrder, order });
                })
                .catch((err) => {
                  console.log(err);
                });
        }else if(paymentMethod === "wallet" ){
              const TotalPrice=amount
              userData.wallet.amount -= TotalPrice;
              userData.wallet.transactions.push({
                amount: TotalPrice,
                transactionType: 'debit',
                timestamp: new Date(),
                description: 'Order payment using wallet amount', 
              });
              userData.save()

              newOrder.PaymentStatus="Paid"
              newOrder.save()

              // console.log("payment is wallet");
              res.json({ codSuccess: true })
        }else {
          res.status(400).send("Invalid payment method");
      }

    } catch (error) {
        console.error("An error occurred:", error);
        console.log("cart data note available 01--");
        res.redirect('errorView/404')
    }
}

//user order success page
function getOderSuccess (req,res){
    res.render('userView/placeOrder'); 
}

//Verify online payment
const postVerifyPayment =async(req,res)=>{
    try{
        let hmac = crypto.createHmac("sha256", process.env.KEY_SECRET);
    console.log(req.body.payment.razorpay_order_id + "|" +req.body.payment.razorpay_payment_id);
    hmac.update(req.body.payment.razorpay_order_id +"|" +req.body.payment.razorpay_payment_id);

    hmac = hmac.digest("hex");
    if (hmac === req.body.payment.razorpay_signature) {
      const orderId = new mongoose.Types.ObjectId(
        req.body.order.createdOrder.receipt
      );
      console.log("reciept", req.body.order.createdOrder.receipt);
      const updateOrderDocument = await orderCollection.findByIdAndUpdate(orderId, {
        PaymentStatus: "Paid",
        PaymentMethod: "online",
      });
    //   console.log("updateOrderDocument",updateOrderDocument);
      // console.log("hmac success");
      res.json({ success: true });
    } else {
      // console.log("hmac failed");
      res.json({ failure: true });
    }
    }catch(error) {
        console.error("failed to verify the payment",error);
        res.render("errorView/404");
    }
}

//User apply coupon
const postUserApplyCoupon=async(req,res)=>{
    try{
        const {couponCode} = req.body;
        let email=req.session.email 
        // console.log("Apply coupon code:",couponCode);
        const userData=await userCollection.findOne({email:email})
        // console.log("userData::::",userData);
        const purchaseAmount=req.session.totalPrice
        // console.log("purchaseAmount:::",purchaseAmount);
        if (!couponCode) {
          return res.json({ success: false, message: 'Please enter coupon code' });
        }
        const coupon = await couponCollection.findOne({ CoupenCode: couponCode });
        // console.log("coupon:::",coupon);
        if (!coupon) {
            return res.json({ success: false, message: 'Coupon not found. please check your coupon code' });
          }
        const isCouponUsed = userData.usedCoupons.some(usedCoupon => usedCoupon.couponCode === couponCode);
        // console.log("isCouponUsed:::",isCouponUsed);
        if (isCouponUsed) {
          return res.json({ success: false, message: 'Coupon already used' });
        }
        if (purchaseAmount < coupon.MinAmount) {
          return res.json({ success: false, message: 'Purchase amount does not meet the minimum requirement for the coupon' });
        }
        const currentDate = new Date();
        const endDate = new Date(coupon.EndDate);
        if (currentDate > endDate) {
            return res.json({ success: false, message: 'Coupon has expired' });
        }
        // console.log("curentDate and EndDate::",currentDate,endDate);
        const discountedAmount = Math.min(purchaseAmount, coupon.DiscountAmount);
        const totalAfterDiscount = purchaseAmount - discountedAmount;
        // console.log("totalAfterDiscount::",totalAfterDiscount);
        req.session.grandTotal=totalAfterDiscount
    //     userData.usedCoupons.push({
    //         couponCode: couponCode,
    //         discountedAmount: discountedAmount,
    //         usedDate: new Date(),
    //       });
    //       await userData.save();
    //   console.log("userData:::",userData);
        
      return res.json({
        success: true,
        message: 'Coupon apply successfully',
        coupon:discountedAmount,
        discountedAmount: discountedAmount,
        grandTotal:totalAfterDiscount
      });
    }catch(error) {
        console.error("Apply coupon based error",error);
        res.render("errorView/404");
    }
}

//User order details page
async function getOrderPage(req,res){
    try{        
        let user=req.session.user
        let email=req.session.email
        // console.log("orderss",email);
        const userData= await userCollection.findOne({ email:email})
        const userId = userData._id
        // .sort({OrderDate:-1})
        const orders = await orderCollection.find({UserId:userId}).sort({OrderDate:-1}).populate('Items.productId')
        // console.log("gyugffg",orders);
        res.render('userView/userOrder',{title:"Order details",user,orders})
    }catch (error) {
        console.error("An error occurred:", error);
        console.log("cart data note available 01--");
        res.render("errorView/404");
    }
}

//User order product view details
async function getOrderProductViewPage(req,res){
    try{
        let orderID=req.params.id
        // console.log("Received order ID:", orderID);
        if (!mongoose.Types.ObjectId.isValid(orderID)) {
            // Handle invalid order ID here, e.g., render an error page
            // console.error("Invalid order ID");
            res.render("errorView/404");
            return;
        }
        // console.log(orderID);
        let user=req.session.user
        const orders = await orderCollection.findOne({_id:orderID}).populate('Items.productId')
        // console.log("222222",orders);
        const TotalPrice = orders.TotalPrice
        if(!orders){
            console.log("DATA NOT");
            res.render("errorView/404");
        }
        const email=req.session.email
        // console.log("email.....",email);
        const userData =await userCollection.findOne({email:email})
        // console.log("userData....",userData);
        const userId=userData._id
        // console.log("userId....",userId);
        // const reviewData = await reviewCollection.find({userId:userId,})
        // console.log("reviewData...",reviewData);

        res.render('userView/userOrderProductView',{title:"Order product view",user,TotalPrice,orders})
    }catch (error) {
        console.error("An error occurred:", error);
        console.log("cart data note available 02--");
        res.render("errorView/404");
    }
}

//Cancel order 
async function getCancelOrder(req,res){
    try{
        let id=req.params.id
        // console.log("111",id);
        const orderData = await orderCollection.findById(id)
        // console.log("222",orderData);
        if(!orderData){
            console.log("Order datas no fount");
            res.render("errorView/404");
        }

        if(orderData.Status === "Order Placed" || orderData.Status === "Shipped" || orderData.Status === "Pending"){
            const updateProducts = orderData.Items
            // console.log("333",updateProducts);
            for(const product of updateProducts){
                const cancelProduct = await productsCollections.findById(product.productId)
                // console.log("444",cancelProduct);
                if(cancelProduct){
                    cancelProduct.AvailableQuantity += product.quantity;
                    await cancelProduct.save();
                }
            }

            if(orderData.PaymentMethod == "online"){
              const userId = orderData.UserId;
              const refundAmount = orderData.TotalPrice;
              await userCollection.findByIdAndUpdate(userId, { $inc: { 'wallet.amount': refundAmount },
              $push:{
                'wallet.transactions':{
                  amount:refundAmount,
                  transactionType:'credit',
                  timestamp: new Date(),
                  description:"Cancel order refund amount"
                }
              }
          },{new : true});
            }
            orderData.Status = "Cancelled";
            await orderData.save();

            res.redirect('/user/orderDetails')
        }else{
            console.log("Order canot be cancelled");
        }

    }catch (error) {
        console.log("cart data note available 03--");
        res.render("errorView/404");
    }
}

//Single product cancelation
const postSignleCancel=async(req,res)=>{
    try{
        // console.log("req.body::",req.body);
        const { productId, orderId } = req.body;

    const order = await orderCollection.findById(orderId);
    // console.log("order::::::::",order);
    const item = order.Items.find((item) => item._id.toString() === productId);

    if (item) {
      item.productStatus = 'Cancelled';
      await order.save();
    }
    const productCount = item.productId
    const productData = await productsCollections.findById(productCount)
    if(productData){
        productData.AvailableQuantity += item.quantity
        await productData.save();
    }
    
    
    res.json({ success: true, message: 'Product canceled successfully' }); 
    }catch (error) {
        res.render("errorView/404");
    }
}

//Invoivce creating
const postGenarateInvoice=async(req,res)=>{
    try {
        let email=req.session.email
        const { orderId } = req.body;
       
        const orderDetails= await orderCollection.find({_id:orderId}).populate("Items.productId");
        
        const ordersId = orderDetails[0]._id;
    
        // console.log(ordersId);
    
        if (orderDetails) {
          // console.log("uSer MaIl....:",email);
          const invoicePath = await generateInvoice(orderDetails,email); 
          res.json({ success: true, message: 'Invoice generated successfully', invoicePath });
        } else {
          res.status(500).json({ success: false, message: 'Failed to generate the invoice' });
        }
      
      
      } catch (error) {
        console.error('error in invoice downloading',error)
        res.status(500).json({ success: false, message: 'Error in generating the invoice' });
      }
      }

//download invoice
const getdownloadInvoice=async(req,res)=>{
   try {
  const id=req.params.orderId
  console.log(id);
  const filePath = path.join(__dirname,'../pdf',`${id}.pdf`)
  console.log('filePath:',filePath);
  res.download(filePath,`invoice.pdf`)
} catch (error) {
  console.error('Error in downloading the invoice:', error);
  res.status(500).json({ success: false, message: 'Error in downloading the invoice' });
}
}

//Product group return
async function postReturnProduct(req,res){
    try {
        const { orderId, returnReason } = req.body;
        const Email = req.session.email;
        // console.log("11111111",returnReason);
        // console.log("email......",Email);
        const User = await userCollection.findOne({ email: Email });
        // console.log("User......",User);
        const userId = User._id;
        // console.log("userId......",userId);
    
        const order = await orderCollection.findOne({ _id: orderId, UserId: userId });
        // console.log("order......",order);
        order.ReturnRequest = {
          reason: returnReason,
          status: "Pending",
          createdAt: new Date(),
        };
    
        await order.save();
    
        const Return = await orderCollection.findByIdAndUpdate(orderId, {
          Status: "Return Pending",
        });
        // console.log("Return......",Return);
    
        res.json({
          success: true,
          message: "Return request submitted successfully",
        });
      } catch (error) {
        console.error("error while submiting the return request:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
}

module.exports={
    getOrderpage,
    postplaceOrder,
    getOderSuccess,
    postVerifyPayment,
    postUserApplyCoupon,
    getOrderPage,
    getOrderProductViewPage,
    getCancelOrder,
    postSignleCancel,
    postGenarateInvoice,
    getdownloadInvoice,
    postReturnProduct
}