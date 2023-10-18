const user = require('../model/user')
const bcrypt = require('bcrypt')
const sendOTP = require("./otpController");
const { use } = require("../router/adminRoutes");
const productsCollections = require('../model/product')
const { ObjectId} = require('mongodb')
require("../util/otpindex")
const OTP = require("../model/otp");

// to index
async function gustView(req,res){
    if(req.session.logged){
        res.redirect('/user/home')
    }else{
        const productData = await productsCollections.find({});
        res.render('userView/index',{title:'Mobi cart',productData,err:false});
    }
}
    

async function usersignup(req,res){
    console.log("user sign up");
    console.log(req.body);
    try {
        const check = await user.find({ email: req.body.email })
        console.log(typeof (check));
        if (check.length == 0) {
            const pass = await bcrypt.hash(req.body.password, 10);
            const data = {
                userName: req.body.userName,
                email: req.body.email,
                password: pass,
            }
            req.session.user = check.userName;
            req.session.data = data;
            req.session.email = data.email
            req.session.signotp=true;
            req.session.logged = true;
            console.log('reached')
            res.redirect("/user/otp-sent");
        } else {
            
            res.redirect('/user/signup')
            console.log("user already exist");
        }
    } catch (e) {
        console.log(e);
        req.session.errmsg = "something went wrong"
        res.redirect('/user/signup')
        console.log("user already exist");
    }
}

// ------------------------------------OTP Sender----------------------------------------------

async function otpSender(req,res){
    if(req.session.signotp || req.session.forgot){
        try{
            console.log(req.session.email);
            console.log("otp route");
            const email=req.session.email;
            console.log(email);
            const createdOTP=await sendOTP(email)
            req.session.email=email;
            console.log("session before verifiying otp :",req.session.email);
            res.status(200).redirect("/user/otp")
        }catch(err){
            console.log(err);
            req.session.errmsg="Sorry at this momment we can't sent otp";
            console.log(req.session.errmsg);
            if(req.session.forgot){
                res.redirect("/user/forgot-pass")
            }
            res.redirect("/userView/userSignup");
        }
    }
}
// -----------------------------------Forgot OTP section----------------------------------------
//password forgote page
const forgot_password_page=(req,res)=>{
    if(req.session.logged){
        res.redirect('/user/home')
    }else{
        res.render('userView/userforgot',{title:"Forgot password",err:false})
    }
}

//password forgote
const forgotPass = async (req, res) => {
    try{
        console.log(req.body);
        const check=await user.findOne({email:req.body.email})
        if(check){
            console.log("good to go:",check);
            const userdata={
                email:check.email,
                userName:check.userName,
                _id:check._id,
            }
            const email=req.body.email
            console.log("Email::: ",email);
            req.session.userdata=userdata;
            req.session.forgot=true
            req.session.email=email;
            console.log("EmailID: ",req.session.email)
           res.redirect("/user/otp-sent") 
        }
        else{
            console.log(check);
            req.session.errmsg="no email found"
            res.redirect("/user/forgot-pass");
        }
    }catch(err){
        console.log(err);
        req.session.errmsg="no email found"
        res.redirect("/user/forgot-pass")
    }

}

//user login
const userLogin = async (req, res) => {
    try {
        const check = await user.findOne({ email: req.body.email },{})
        console.log(check);
        if(check){
        // console.log(req.body);
        let isMatch = await bcrypt.compare(
            req.body.password,
            check.password
        );
        if (isMatch) {
            if(check.status===true){
                req.session.email = check.email;
                req.session.user = check.userName;
                req.session.logged = true;
                console.log("Login success");
                res.redirect("/user/home");
            }else{
                console.log("user blocked");
                res.render("userView/userlogin",{title:"login page",err:"You are blocked"})
            }
        }
        else {
            // req.flash("errmsg","*invalid password")
            // req.session.errmsg = "invalid password"
            res.render("userView/userlogin",{title:"login page",err:"invalid user name or password.."})
            console.log("invalid password");
        }}else{
            // req.flash("errmsg","*User not found")
            // req.session.errmsg = "User not found"
            res.render("userView/userlogin",{title:"login page",err:"invalid user name or password."})
            console.log("User not found..");

        }
    } catch {
        // req.flash("errmsg","*invalid user name or password")
        // req.session.errmsg = "invalid user name or password"
        res.redirect('/')
        console.log("user not found");
    }
}

//OTP VERIFICATION
async  function OtpConfirmation(req,res){
    if(req.session.forgot){
        console.log(req.body);
    try{
        const email=req.session.email
        console.log("forgot confirmation :",email);
        const Otp= await OTP.findOne({email:email})

        if(Date.now()>Otp.expireAt){
            await OTP.deleteOne({email: req.session.email});

        }else{
            const hashed=Otp.otp
            const match=await bcrypt.compare(req.body.code,hashed);
            if(match){
                req.session.logged=true;
                req.session.forgot=false;
                req.session.pass_reset = true
                res.render("userView/resetPass",{title:"Reset password"});
            }
            else{
                console.log("no match");
                req.session.userdata="";
                req.session.errmsg="Invalid OTP"
                res.redirect("/user/otp")
                // res.render('userView/otplogin',{title:"otp page",err:"otp is invalid"})
            }
        }
    }catch(err){
        console.log(err);
        req.session.errmsg="Email not found";
    }
    }
    else if(req.session.signotp){
        console.log(req.body)
        try{
            const data =req.session.data;
            const dataplus = {
                userName: data.userName,
                email: data.email,
                password: data.password,
                status: "Active",
                timeStamp: Date.now()
            }
            console.log(req.session.data);
            const Otp= await OTP.findOne({email:data.email})
            console.log(Otp.expireAt);
            if(Date.now()>Otp.expiredAt){
                await OTP.deleteOne({email});
            }else{
                const hashed=Otp.otp
                const match=await bcrypt.compare(req.body.code,hashed);
                if(match){
                    console.log(data);
                    const result=await user.create({...data,name:data.email})
                    req.session.logged=true;
                    req.session.signotp=false
                    res.redirect("/user/home")
    
                }
                else{
                    req.session.errmsg="Invalid OTP"
                    res.redirect("/user/otp")
                }
            }
            
            
        }catch(err){
            console.log(err);
            res.redirect("/user/otp")
        }
    }
}

//Reset password section
const get_password_reset = (req, res) => {
    if (req.session.pass_reset) {
        res.render("userView/resetPass",{title:"Reset password"});

    } else {
        res.redirect("/")
    }
}

const password_reset = async (req, res) => {
    try {
        console.log(req.body);
        const pass = await bcrypt.hash(req.body.password, 10);
        const email = req.session.email
        console.log(email);
        const update = await user.updateOne({ email: email }, { $set: { password: pass } })
        req.session.logged = true;
        req.session.pass_reset = false
        res.redirect("/user/home")
    } catch (err) {
        req.flash("errmsg", "something went wrong")
        console.log(err);
    }
}



//get product details page
async function getProducDetails(req,res){
    if(req.session.logged){
        try{
            console.log("ghuggg");
            const ProductID = req.params.id;
            console.log(ProductID);
            const productData = await productsCollections.findById(ProductID);
            console.log('product view reached');
            let user = req.session.user
            res.render('userView/product-Details',{title:"product details",user,productData})
        }catch(error){
            res.status(500).send('Internal server error')
        }
    }else{
        console.log("qwerty");
        res.redirect('/user/logout')
    }
}



//Logout
const logout = (req,res) => {
    req.session.destroy((err)=>{
        if(err){
            console.log(err);
            res.send('Error');
        }else{
            res.redirect('/');
        }
    });
}

module.exports={
    gustView,
    usersignup,
    otpSender,
    OtpConfirmation,
    userLogin,
    forgotPass,
    forgot_password_page,
    get_password_reset,
    getProducDetails,
    password_reset,
    logout
}