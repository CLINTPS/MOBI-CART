const cartCollection = require('../model/cart');
const userCollection = require('../model/user');
const orderCollection = require('../model/order')

const { ObjectId } = require('mongodb');

const  getCartPage=async(req,res)=>{
 
    try{
      let user=req.session.user
        const email = req.session.email;
        // console.log("get 3:" +email)
        const users = await userCollection.findOne({ email: email });

        if (!users) {          
            return res.status(404).render('error/404');
        }
        // console.log("get 3:" + users._id);

      const userId = users._id;
      // console.log("0",userId);
      const order = await orderCollection.findOne({
        UserId: userId,
        PaymentMethod: 'online',
        PaymentStatus: 'Pending'
      });
      // console.log("1",order);
      let orderId = order ? order._id : null;
      // console.log("2",orderId);
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
                    // console.log(">>>>>>>>>>>>>>>>>");
                    await userCart.save();
                }
                await orderCollection.deleteOne({ _id: orderId });

        } catch (error) {
            console.error('Error processing order:', error);
        }
      }

      const cart = await cartCollection.findOne({ userId: userId }).populate("products.productId" );
     

      if (!cart || cart.products.length === 0) {
      
        return res.render('userView/userCart', {title:"Cart view",user,
           username: email,
           product :[] ,
           subtotal:0,
           total:0,
           coupon:0,
           gstAmount:0,
           totalQuantity:0

          });
    }

    const product = cart.products;
    //     console.log("get 4:" +cart);

    //   console.log("get 5:" +product);
    //   console.log("get 6:" +product[0].productId);
    //   console.log("get 7:" +product);


      let subtotal = 0;
      let totalQuantity = 0;

      cart.products.forEach(item => {
        subtotal += item.quantity * item.productId.DiscountAmount;
        totalQuantity += item.quantity;
      });

      // const gstRate = 0.12; 
    const gstAmount = 0 ;
    const coupon = '';
    const total = subtotal ;

    if (coupon) {
      const couponValue = 50;
      total -= couponValue;
    }
    req.session.totalPrice=total;

    res.render('userView/userCart', {title:"Cart view",user,
      username: email,
      product: cart.products,
      cart,
      subtotal: subtotal,
      gstAmount: gstAmount.toFixed(2),
      totalQuantity:totalQuantity,
      coupon: coupon,
      total: total,
    });
  
    }catch(error){
        console.log("error in view cart");
        res.render('errorView/404')
    }
}

// Add to cart
const postAddtocart = async (req, res) => {
    try {
      const userEmail = req.session.email;
    //   console.log("1:"+userEmail);
      const user = await userCollection.findOne({ email: userEmail });
      
    //   console.log("2:"+ user._id);
      const userId = user._id;
     
      const productId= req.params.productId;
  
    //   console.log("3:"+productId);
  
      const check = await cartCollection.findOne({ userId: userId });
  
    //   console.log("4:"+check);
  
      if (check !== null) {
        //   console.log("5:");
  
          const existingCart = check.products.find((item) =>
          item.productId.equals(productId)
        );
        if (existingCart) {
          existingCart.quantity += 1;
        } else {
          check.products.push({ productId: productId, quantity: 1 });
        }
        await check.save();
        
          req.flash("msg", "Item added to the cart");
          res.json({ success: true, message: "Item added to the cart" });
        } else {
        //   console.log("6:");
          const newCart = new cartCollection({
            userId: userId,
            products: [{ productId: new ObjectId(productId), quantity: 1 }],
          });
        //   console.log("7:"+newCart);
          await newCart.save();
          res.json({ success: true, message: "Item added to the cart" });
          req.flash("msg", "Item added to the cart");
          // res.redirect("/");
        }
      } catch (err) {
        console.log(
          err,
          "cart error"
        );
        res.status(500).json({ success: false, error: "Failed to add product to the cart" });
        req.flash("errmsg", "sorry at this momment we can't reach");
        res.render('errorView/404')
      }
    }

 //update quantity
 const postQuantity=async(req,res)=>{
    const { productId, quantity,cartId } = req.body;
    // console.log("1:"+productId);
    // console.log("2:"+quantity);
    // console.log("3:"+cartId);
    try{

      const cart = await cartCollection.findOne({ _id: cartId }).populate("products.productId" )
      console.log("111",cart);
      if (!cart) {
        return res.status(404).json({ success: false, error: "Cart not found" });
      }
      const productInCart = cart.products.find(item => item.productId.equals(productId));
  
      if (!productInCart) {
        return res.status(404).json({ success: false, error: "Product not found in the cart" });
      }
      productInCart.quantity = quantity;
  
      await cart.save();
  
      let subtotal = 0;
      let totalQuantity = 0;
      
      cart.products.forEach((item) => {
        // console.log(item,"isinde for each");
      subtotal += item.quantity * item.productId.DiscountAmount;
      totalQuantity += item.quantity;
    });
    console.log(subtotal);

    const gstRate = 0.12;
    const gstAmount = subtotal * gstRate;
    const coupon = ''; 
    let total = subtotal + gstAmount;

    if (coupon) {
      const couponValue = 50; 
      total -= couponValue;
    }

    req.session.totalPrice=total
    
    res.json({
      success: true,
      subtotal: subtotal,
      gstAmount: gstAmount,
      totalQuantity: totalQuantity,
      coupon: coupon,
      total: total,
    });


    }catch (error) {
      console.error('Error updating stock quantity:', error);
      res.status(500).json({ success: false, error: "Failed to  update stock quantity" });
    }
  }

  //Product remove to cart
const postRemoveProduct= async(req,res)=>{
    try{
        const {productId,cartId} = req.body;
        const cart = await cartCollection.findById(cartId)
        if(!cart){
            return res.status(404).json({ success: false, error: "Cart not found" });
        }
        cart.products = cart.products.filter((item)=>!item.productId.equals(productId))
        await cart.save();
        res.json({success:true})

    }catch(error){
        console.error('Error removing product from the cart:', error)
        res.status(500).json({ success: false, error: "Failed to remove product from the cart" });

    }
}


module.exports = {
    getCartPage,
    postAddtocart,
    postQuantity,
    postRemoveProduct
}
