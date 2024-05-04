const express = require("express");
const userRout = express.Router();
const userControl = require("../controller/userControl");
const userProduct = require("../controller/userProduct")
const userAuth = require('../middleware/userAuth')
const userBlock = require('../middleware/userBlock')
const cartControl = require('../controller/cartControl')
const orderControl = require('../controller/orderControl')
const userProfile = require('../middleware/profileMulter')
const userWishlist = require('../controller/userWishlistControl')
const reviewControl = require('../controller/reviewControl')
// const errorHandler = require('../middleware/errorMiddleware')


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

//Filter product
userRout.post('/filterProduct',userAuth.verifyUser,userProduct.postFilterProduct)

// Serch product in all page
userRout.post('/serchAllPorductsShop',userAuth.verifyUser,userProduct.postSerchAllProduct)

//User profile side
userRout.get('/user/profile',userAuth.verifyUser,userControl.getUserprofile)

//User profile picture
userRout.post('/UserProfilePicture',userAuth.verifyUser,userProfile.single('profilePicture'),userControl.postUserProfile)

//User wishlist
userRout.get('/userWhislist',userAuth.verifyUser,userWishlist.getWhislist)
userRout.post('/wishlist',userAuth.verifyUser,userWishlist.postWishlist)
userRout.post('/wishlistdelete/',userAuth.verifyUser,userWishlist.postDeleteWishlist)

//User addresses
userRout.get('/user/AddressBook',userAuth.verifyUser,userControl.getAddressBook)
userRout.post('/user/addAddress',userAuth.verifyUser,userControl.postAddress)
userRout.post('/user/editUserAddress/:id', userAuth.verifyUser, userControl.postEditAddress);
userRout.get('/deleteAddress/:id',userAuth.verifyUser,userControl.getDeleteAddress)

//user coupons
userRout.get('/user/offerCoupons',userAuth.verifyUser,userControl.getUserCoupons)

//User wallet history
userRout.get('/user/walletHistory',userAuth.verifyUser,userControl.getWalletHistory)

//user change password
userRout.get('/user/changepass',userAuth.verifyUser,userControl.getChangepass)
userRout.post('/changePasswordData',userAuth.verifyUser,userControl.postChangepass)

//User cart
userRout.post('/addtocart/:productId',userAuth.verifyUser,cartControl.postAddtocart)
userRout.get('/user/cart',userAuth.verifyUser,cartControl.getCartPage)
userRout.post('/updatequantity',userAuth.verifyUser,cartControl.postQuantity)
userRout.post('/romoveProduct',userAuth.verifyUser,cartControl.postRemoveProduct)

//Check out page
userRout.get('/checkOut',userAuth.verifyUser,orderControl.getOrderpage)
userRout.post('/placeOrder',userAuth.verifyUser,orderControl.postplaceOrder)
userRout.get('/ordersuccess',userAuth.verifyUser,orderControl.getOderSuccess)
userRout.post('/VerifyOnlinePayment',userAuth.verifyUser,orderControl.postVerifyPayment)

//Coupon apply post
userRout.post('/applyCoupon',userAuth.verifyUser,orderControl.postUserApplyCoupon)

//User order details
userRout.get('/user/orderDetails',userAuth.verifyUser,orderControl.getOrderPage)
userRout.get('/orderProductView/:id',userAuth.verifyUser,orderControl.getOrderProductViewPage)
userRout.get('/cancelOrderData/:id',userAuth.verifyUser,orderControl.getCancelOrder)
userRout.post('/downloadinvoice',userAuth.verifyUser,orderControl.postGenarateInvoice)
userRout.get('/downloadinvoice/:orderId',userAuth.verifyUser,orderControl.getdownloadInvoice)

//single product cancel
userRout.post('/cancel-product',userAuth.verifyUser,orderControl.postSignleCancel)

//Product return 
userRout.post('/submitreturn',userAuth.verifyUser,orderControl.postReturnProduct)

//user Review And Rating modal
userRout.post('/userReviewAndRating',userAuth.verifyUser,reviewControl.postUserReviewAndRating)

//Aading and editing review
userRout.get('/editReviewAndRating',userAuth.verifyUser,reviewControl.getReviewpage)
userRout.post('/userReviewAndRatingAddAndEdit',userAuth.verifyUser,reviewControl.ReviewAndRatingAddAndEdit)

// router.use(errorHandler.errorHandler)


module.exports = userRout