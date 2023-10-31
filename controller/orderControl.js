
const orderCollection = require('../model/order')
const userCollection = require('../model/user')
const cartCollection=require('../model/cart')
const productsCollections = require ('../model/product')
const moment = require("moment")

//Get check out page
async function getOrderpage(req,res){
    let user=req.session.user
    const userAddressData = await userCollection.findOne({ userName: user })
    res.render('userView/userCheckout',{title:"Checkout page",user,userAddressData})
}

//post ckeck out page
async function postplaceOrder(req, res) {
    const email = req.session.email;
    console.log("cart 1=" + email);
    let datas = req.body;
    console.log(datas);
    const addressID = req.body.selectedAddress;
    const paymentMethod = req.body.selectedPayment;
    const amount = req.session.totalPrice;
    console.log(amount);
    
    try {
        const userData = await userCollection.findOne({ email: email });
        console.log(userData);
        
        if (!userData) {
            console.log("cart data note available");
            res.render("errorView/404admin");
            return;
        }

        const userID = userData._id;
        console.log(userID);

        const cartData = await cartCollection.findOne({ userId: userID }).populate("products.productId");
        console.log(cartData);

        if (!cartData) {
            console.log("Cart data not available");
            res.render("errorView/404admin");
            return;
        }

        const newOrder = new orderCollection({
            userId: userID,
            Items: cartData.products,
            PaymentMethod: paymentMethod,
            OrderDate: moment(new Date()).format("llll"),
            ExpectedDeliveryDate: moment().add(4, "days").format("llll"),
            TotalPrice: amount,
            Address: addressID,
        });

        const order = await newOrder.save();
        req.session.orderID = order._id;
        console.log("Order detail", order);
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

        if (paymentMethod === "cod") {
            res.render('userView/codSucces');
        }
    } catch (error) {
        console.error("An error occurred:", error);
        console.log("cart data note available 01--");
        res.render("errorView/404admin");
    }
}



async function getOrderPage(req,res){
    res.render('userView/userOrder')
}

module.exports={
    getOrderpage,
    postplaceOrder,
    getOrderPage,
}