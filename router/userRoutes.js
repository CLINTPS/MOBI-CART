const express = require("express");
const session = require("express-session");
const userRout = express.Router();
const userControl = require("../controller/userControl");
const userProduct = require("../controller/userProduct")
const passport = require("passport")
const bcrypt = require("bcrypt")
require('../config/passport');
const USER = require('../model/user');
const { sendOTP } = require("../controller/otpController");
const OTP = require('../model/otp');
const productsCollections = require('../model/product');
const router = require("./adminRoutes");
const userAuth = require('../middleware/userAuth')
const userBlock = require('../middleware/userBlock')
const cartControl = require('../controller/cartControl')


// Gust view
userRout.get('/',userAuth.userExist,userControl.gustView);

//error page
userRout.get('/error',(req,res)=>{
    res.render('errorView/404')
})

//gust page to login page
userRout.get('/user/Login-Signup',userAuth.userExist,userControl.getLoginPage)
userRout.post("/user/login",userAuth.userExist,userControl.userLogin);

// login to sign up
userRout.get("/user/Signup",userAuth.userExist,userControl.getSignupPage)
userRout.post("/user/Signup",userControl.usersignup)

//Signup to login
userRout.get("/user/login-page",userAuth.userExist,userControl.getSignupPageToLogin)

//sign up to otp page
userRout.get('/user/otp',userAuth.userExist,userControl.getOtpPage)

userRout.get("/user/otp-sent", userControl.otpSender);
userRout.post("/user/otp", userControl.OtpConfirmation);

//user logged home page
userRout.get("/user/home",userBlock,userControl.getHomePage)

//login to forgot page and forgot password
userRout.get('/user/forgot-pass', userControl.forgot_password_page)
userRout.post('/user/forgot-PassWord', userControl.forgotPass)
//Reset password
userRout.get('/user/conformPass', userControl.get_password_reset)
userRout.post('/user/conformPass', userControl.password_reset)

//Resent otp
userRout.get('/user/resend-otp', userControl.otpSender)


//user logout
userRout.get("/user/logout", userControl.logout)

//product details
userRout.get('/productDetails/:id',userAuth.verifyUser,userProduct.getProducDetails);
//product full details
userRout.get('/allProducts',userAuth.verifyUser,userProduct.getAllProducts)

//User profile
userRout.get('/user/profile',userAuth.verifyUser,userControl.getUserprofile)
//User addresses
userRout.get('/user/AddressBook',userControl.getAddressBook)
userRout.post('/user/addAddress',userControl.postAddress)

//User cart
userRout.post('/addtocart/:productId',userAuth.verifyUser,cartControl.postAddtocart)
userRout.get('/user/cart',userAuth.verifyUser,cartControl.getCartPage)
userRout.post('/updatequantity',userAuth.verifyUser,cartControl.postQuantity)
userRout.post('/romoveProduct',userAuth.verifyUser,cartControl.postRemoveProduct)


module.exports = userRout