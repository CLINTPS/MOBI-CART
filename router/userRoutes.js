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

//user login

userRout.get('/',(req,res)=>{
    res.render('userView/userLogin',{title:'Login page',err:false});
})
userRout.post("/user/login",userControl.userLogin);

// login to sign up
userRout.get("/user/Signup",(req,res)=>{
    res.render("userView/userSignup",{title:"Signup page",err:false})
})
userRout.post("/user/Signup",userControl.usersignup)

//Signup to login
userRout.get("/user/login-page",(req,res)=>{
    res.render('userView/userLogin',{title:'Login page',err:false});})

//Otp
userRout.get("/user/otp-sent",userControl.otpSender);

//sign up to otp page
userRout.get('/user/otp',(req,res)=>{
    res.render('userView/otplogin',{title:'otp page',err:false})
})
userRout.post("/user/otp",userControl.OtpConfirmation);

//user logged home page
userRout.get("/user/home",(req,res)=>{
    if(req.session.logged||req.user){
        console.log(req.session.logged);
        res.render("userView/userhome",{title:"Home Page",err:false})
    }
    else{
        console.log(req.session.logged);
        res.redirect("/")
    }
})


//user logout
userRout.get("/user/logout",userControl.logout)

module.exports=userRout