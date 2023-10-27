const userCollection = require('../model/user')
const bcrypt = require('bcrypt')
const sendOTP = require("./otpController");
const { use } = require("../router/adminRoutes");
const productsCollections = require('../model/product')
const { ObjectId} = require('mongodb')
require("../util/otpindex")
const OTP = require("../model/otp");

// to index
async function gustView(req,res){
        const productData = await productsCollections.find({});
        res.render('userView/index',{title:'Mobi cart',productData,err:false});
}

//gust page to login page
const getLoginPage = (req,res)=>{
        res.render('userView/userLogin', { title: 'Login page', err: false });
}

// login to sign up
const getSignupPage= (req, res) => {
        res.render("userView/userSignup", { title: "Signup page", err: false })
}

//Signup to login
const getSignupPageToLogin = (req, res) => {
        res.redirect('/user/Login-Signup')   
}

//sign up to otp page
const getOtpPage = (req, res) => {
        res.render('userView/otplogin', { title: 'otp page', err: false })
}

//user logged home page
async function getHomePage(req, res){
    if (req.session.logged || req.user) {
        let user = req.session.user
        
        const productData = await productsCollections.find({});
        res.render("userView/userhome", { title: "Home Page", productData, user, err: false })
    }
    else {
        res.redirect('/')
    }
}

//User signup
async function usersignup(req,res){
    console.log("user sign up");
    console.log(req.body);
    try {
        const check = await userCollection.find({ email: req.body.email })
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
            req.session.signotp = true;
            // req.session.logged = true;
            console.log('reached')
            res.redirect("/user/otp-sent");
        } else {
            
            res.redirect('/user/signup')
            console.log("user already exist");
        }
    } catch (e) {
        console.log(e);
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
        res.redirect('/user/login-page')
    }else{
        res.render('userView/userforgot',{title:"Forgot password",err:false})
    }
}

//password forgote
const forgotPass = async (req, res) => {
    try{
        console.log(req.body);
        const check=await userCollection.findOne({email:req.body.email})
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

//----------------------------------user login---------------------------------

const userLogin = async (req, res) => {

    try {
        const check = await userCollection.findOne({ email: req.body.email }, {});

        if (check) {
            let isMatch = await bcrypt.compare(req.body.password, check.password);
            if (isMatch) {
                if (check.status === true) {
                    req.session.email = check.email;
                    req.session.user = check.userName;
                    req.session.logged = true;
                    console.log("Login success");
                    res.json({ success: true });
                } else {
                    console.log("user blocked");
                    res.json({ success: false, message: "You are blocked" });
                }
            } else {
                res.json({ success: false, message: "Invalid user name or password" });
                console.log("Invalid password");
            }
        } else {
            res.json({ success: false, message: "Invalid user name or password" });
            console.log("User not found");
        }
    } catch (error) {
        res.json({ success: false, message: "An error occurred" });
        console.error("An error occurred", error);
    }
    
}
// -----------------------OTP verification of SignUp and forgotPass------------------------------

//OTP VERIFICATION
async  function OtpConfirmation(req,res){
    if(req.session.forgot){
        console.log(req.body);
    try{
        const email=req.session.email
        console.log("forgot confirmation :",email);
        const Otp= await OTP.findOne({email:email},{})
        
        if(Date.now()>Otp.expireAt){
            await OTP.deleteOne({email: req.session.email});

        }else{
            const hashed=Otp.otp
            const match=await bcrypt.compare(req.body.code,hashed);
            if(match){
                req.session.logged=true;
                req.session.forgot=false;
                req.session.pass_reset = true
                req.session.user=Otp.email
                res.render("userView/resetPass",{title:"Reset password"});
            }
            else{
                console.log("no match");
                req.session.userdata="";
                res.render('userView/otplogin',{title:"Otp page",err:"Invalid OTP"})
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

                    const result=await userCollection.create({...data,name:data.email})
                    req.session.logged=true;
                    req.session.signotp=false
                    req.session.user = data.userName;
                    req.session.email= data.email
                    res.redirect("/user/home")
    
                }
                else{
                    // req.session.errmsg="Invalid OTP"
                    res.render('userView/otplogin',{title:"Otp page",err:"Invalid OTP"})
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
        res.redirect("/user/login-page")
    }
}

const password_reset = async (req, res) => {
    try {
        console.log(req.body);
        const pass = await bcrypt.hash(req.body.password, 10);
        const email = req.session.email
        // console.log(email);
        const update = await userCollection.updateOne({ email: email }, { $set: { password: pass } })
        req.session.logged = true;
        req.session.pass_reset = false
        res.redirect("/user/login-page")
    } catch (err) {
        req.flash("errmsg", "something went wrong")
        console.log(err);
    }
}

//User profile
async function getUserprofile(req,res){
    try{
        let user = req.session.user
        const UserData = await userCollection.findOne({userName:user})
        res.render('userView/userProfile',{title:"Profile view",user,UserData})
    }catch(error){
        console.log("can't profile details");
    }
}

//user Address book
async function getAddressBook(req,res){
    try{
        let user = req.session.user
        const userAddressData = await userCollection.findOne({userName:user})
        res.render('userView/userAddress',{title:"Address view",user,userAddressData})
    }catch(error){
        console.log("can't add Address");
    }
}
// add address
const postAddress = async(req,res)=>{
    try{
        let email =req.session.email
        console.log(email);
        let data={
            nameuser:req.body.nameuser,
            addressLine:req.body.addressLine,
            city:req.body.city,
            pincode:req.body.pincode,
            state:req.body.state,
            mobile:req.body.mobile
        }
        console.log(data);
        const userAddress = await userCollection.findOne({email:email})
        console.log(userAddress);
        userAddress.address.push(data)
        await  userAddress.save()
        res.redirect('/user/profile')
    }catch(error){
        console.log("can't post Address");
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
    getLoginPage,
    getSignupPageToLogin,
    getSignupPage,
    getOtpPage,
    getHomePage,
    usersignup,
    otpSender,
    OtpConfirmation,
    userLogin,
    forgotPass,
    forgot_password_page,
    get_password_reset,
    password_reset,
    getUserprofile,
    getAddressBook,
    postAddress,
    logout
}