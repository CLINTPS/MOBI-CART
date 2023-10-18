const express=require("express");
const session = require("express-session");
const userRout=express.Router();
const userControl=require("../controller/userControl");
const passport=require("passport")
const bcrypt=require("bcrypt")
require('../config/passport');
const USER=require('../model/user');
const {sendOTP}=require("../controller/otpController");
const OTP=require('../model/otp');
const productsCollections=require('../model/product');
const router = require("./adminRoutes");

// Gust view
userRout.get('/',userControl.gustView);


//gust page to login page
userRout.get('/user/Login-Signup',(req,res)=>{
    if(req.session.logged){
        res.redirect('/user/home');
    }else{

        res.render('userView/userLogin',{title:'Login page',err:false});
    }
})
userRout.post("/user/login",userControl.userLogin);

// login to sign up
userRout.get("/user/Signup",(req,res)=>{
    if(req.session.logged){
        res.redirect('/user/home')
    }
    res.render("userView/userSignup",{title:"Signup page",err:false})
})
userRout.post("/user/Signup",userControl.usersignup)

//Signup to login
userRout.get("/user/login-page",(req,res)=>{
    res.render('userView/userLogin',{title:'Login page',err:false});})

    
//sign up to otp page
userRout.get('/user/otp',(req,res)=>{
    res.render('userView/otplogin',{title:'otp page',err:false})
})
userRout.get("/user/otp-sent",userControl.otpSender);
userRout.post("/user/otp",userControl.OtpConfirmation);

//user logged home page
userRout.get("/user/home",async (req,res)=>{
    if(req.session.logged||req.user){
        let user = req.session.user
        // console.log(user);
        console.log(req.session.logged);
        const productData = await productsCollections.find({});
        res.render("userView/userhome",{title:"Home Page",productData,user,err:false})
    }
    else{
        res.redirect('/')
    }
})

//login to forgot page and forgot password
userRout.get('/user/forgot-pass',userControl.forgot_password_page)
userRout.post('/user/forgot-PassWord',userControl.forgotPass)
//Reset password
userRout.get('/user/conformPass',userControl.get_password_reset)
userRout.post('/user/conformPass',userControl.password_reset)


//product details
userRout.get('/productDetails/:id',userControl.getProducDetails);

//user logout
userRout.get("/user/logout",userControl.logout)



module.exports=userRout