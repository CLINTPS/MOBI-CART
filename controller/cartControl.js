const cartCollection = require('../model/cart');
const userCollection = require('../model/user');
const { ObjectId } = require('mongodb');

// Get user cart
const getuserCart = async (req, res) => {
    try {
        const email = req.session.email;
        let user = req.session.user;
        const usersdata = await userCollection.findOne({ email: email });
        console.log("12345678:"+usersdata);
        if (!usersdata) {
            return res.status(404).render('errorView/404');
        }

        const userId = usersdata._id;
        console.log("userId:"+userId);
        const cart = await cartCollection.findOne({ userId: userId }).populate("products.productId");
        console.log(cart);
        if (!cart || cart.products.length === 0) {
            return res.render("userView/userCart", {
                title: "cart",user,
                product: [],
                subtotal: 0,
                total: 0,
                coupon: 0,
                gstAmount: 0,
                totalQuantity: 0
            });
        }

        const product = cart.products;

        let subtotal = 0;
        let totalQuantity = 0;

        cart.products.forEach(item => {
            subtotal += item.quantity * item.productId.descountedPrice;
            totalQuantity += item.quantity;
        });

        const gstRate = 0.12;
        const gstAmount = subtotal * gstRate;
        const coupon = '';
        const total = subtotal + gstAmount;

        if (coupon) {
            const couponValue = 50;
            total -= couponValue;
        }

        res.render("userView/userCart", {
            title: "cart",user,
            product: cart.products,
            cart,
            subtotal: subtotal,
            gstAmount: gstAmount.toFixed(2),
            totalQuantity: totalQuantity,
            coupon: coupon,
            total: total,
        });

    } catch (error) {
        console.log("error in view cart");
        res.render('errorView/404');
    }
}

// Product add to cart
const getAddcart = async (req, res) => {
    try {
        let user = await userCollection.findOne({ email: req.session.email });
        let userId = user._id;
        const productId = req.params.id;
        const check = await cartCollection.findOne({ userId: userId });

        if (check !== null) {
            const checkExisting = check.products.find((item) =>
                item.productId.equals(productId));

            if (checkExisting) {
                checkExisting.quantity += 1;
            } else {
                check.products.push({ productId: productId, quantity: 1 });
            }

            await check.save();
            res.json({ success: true, message: "Item Added To cart" });
        } else {
            const newCart = new cartCollection({
                userId: userId,
                products: [{ productId: new ObjectId(productId), quantity: 1 }],
            });

            await newCart.save();
            res.json({ success: true, message: "Item added to cart" });
        }
    } catch (error) {
        console.log(error, "something error in cart adding");
        res.render('errorView/404');
    }
}

module.exports = {
    getuserCart,
    getAddcart
}
