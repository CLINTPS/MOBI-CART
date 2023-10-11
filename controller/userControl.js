const user = require('../model/user')
const bcrypt = require('bcrypt')
const sendOTP = require("./otpController");
const { use } = require("../router/adminRoutes");

require("../util/otpindex")
const OTP = require("../model/otp");

async function usersignup(req,res){
    console.log("user sign up");
    console.log(req.body);
    try {
        const check = await user.find({ email: req.body.email })
        console.log(typeof (check));
        if (check.length == 0) {
            const pass = await bcrypt.hash(req.body.password, 10);
            const data = {
                userName: req.body.name,
                email: req.body.email,
                password: pass,
            }
            req.session.data = data;
            req.session.email = data.email
            req.session.signotp=true;
            console.log('reached')
            res.redirect("/user/otp-sent");
        } else {
            req.session.errmsg = "user already exist"
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
            req.session.email=email.toString();
            console.log("Sessiosiiii: ",req.session.email)
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
        const check = await user.findOne({ email: req.body.email })
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
                req.session.logged = true;
                console.log("Login success");
                res.redirect("/user/home");
            }else{
                console.log("user blocked");
                res.render("userView/userlogin",{title:"login page",err:"You are blocked"})
            }
        }
        else {
            req.flash("errmsg","*invalid password")

            req.session.errmsg = "invalid password"
            res.redirect('/')
            console.log("invalid password");
        }}else{
            req.flash("errmsg","*User not found")
            res.render("userView/userlogin",{title:"login page",err:"invalid user name or password"})
            req.session.errmsg = "User not found"
            console.log("User not found..");

        }
    } catch {
        req.flash("errmsg","*invalid user name or password")
        req.session.errmsg = "invalid user name or password"
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
                res.redirect("/user/home");
            }
            else{
                console.log("no match");
                req.session.userdata="";
                req.session.errmsg="Invalid OTP"
                // res.redirect("/user/otp")
                res.render('userView/otplogin',{title:"otp page",err:"otp is invalid"})
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
            console.log(req.session.data);
            const Otp= await OTP.findOne({email:data.email})
            console.log(Otp.expireAt);
            if(Date.now()>Otp.expiredAt){
                await OTP.deleteOne({email});
            }else{
                const hashed=Otp.otp
                const match=await bcrypt.compare(req.body.code,hashed);
                if(match){
                    const result=await user.insertMany([data])
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
    // getloginpage,
    // getsignup,
    // getsignuppage,
    // postsignup,
    usersignup,
    otpSender,
    OtpConfirmation,
    userLogin,
    forgotPass,
    logout
}