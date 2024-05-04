const userCollection = require('../model/user')
const bannerCollection = require('../model/banner')
const bcrypt = require('bcryptjs')
const sendOTP = require("./otpController");
const { use } = require("../router/adminRoutes");
const productsCollections = require('../model/product')
const couponCollection = require('../model/coupon')
const wishlistCollection = require('../model/wishlist')
const { ObjectId } = require('mongodb')
require("../util/otpindex")
const OTP = require("../model/otp");
const sharp = require('sharp')
const fs = require('fs');
const path = require('path');

// to index
async function gustView(req, res) {
    const productData = await productsCollections.find({});
    const bannerImg = await bannerCollection.find({}).sort({date:-1}).limit(1)
    res.render('userView/index', { title: 'Mobi cart', productData,bannerImg,err: false });
}

//gust page to login page
const getLoginPage = (req, res) => {
    res.render('userView/userLogin', { title: 'Login page', err: false });
}

// login to sign up
const getSignupPage = (req, res) => {
    const reffer = req.query.ref;
    console.log("reffer code:",reffer);
    res.render("userView/userSignup", { title: "Signup page",reffer ,err: false })
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
async function getHomePage(req, res) {
    if (req.session.logged || req.user) {
        let user = req.session.user
        let email = req.session.email
        const userData = await userCollection.findOne({email:email})
        const userId = userData._id
        const productData = await productsCollections.find({});
        const bannerImg = await bannerCollection.find({}).sort({date:-1}).limit(1)
        const userWishlist = await wishlistCollection.findOne({user:userId})
        const wishlist = userWishlist ? userWishlist.products : [];
        res.render("userView/userhome", { title: "Home Page", productData,bannerImg,wishlist,user, err: false })
    }
    else {
        res.redirect('/')
    }
}

//User signup
async function usersignup(req, res) {
    console.log("user sign up.......",req.body);
    try {
        const check = await userCollection.find({ email: req.body.email })
        console.log(typeof (check));
        if (check.length == 0) {
            const pass = await bcrypt.hash(req.body.password, 10);
            const data = {
                userName: req.body.userName,
                email: req.body.email,
                password: pass,
                reffer:req.body.referralId
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

async function otpSender(req, res) {
    if (req.session.signotp || req.session.forgot) {
        try {
            // console.log("otp route");
            const email = req.session.email;
            // console.log("Email..",email);
            const createdOTP = await sendOTP(email)
            // console.log("OTP:",createdOTP);
            req.session.email = email;
            // console.log("session before verifiying otp :", req.session.email);
            res.status(200).redirect("/user/otp")
        } catch (err) {
            console.log(err);
            req.session.errmsg = "Sorry at this momment we can't sent otp";
            console.log(req.session.errmsg);
            if (req.session.forgot) {
                res.redirect("/user/forgot-pass")
            }
            res.redirect("/userView/userSignup");
        }
    }
}
// -----------------------------------Forgot OTP section----------------------------------------
//password forgote page
const forgot_password_page = (req, res) => {
    if (req.session.logged) {
        res.redirect('/user/login-page')
    } else {
        res.render('userView/userforgot', { title: "Forgot password", err: false })
    }
}

//password forgote
const forgotPass = async (req, res) => {
    try {
        // console.log(req.body);
        const check = await userCollection.findOne({ email: req.body.email })
        if (check) {
            // console.log("good to go:", check);
            const userdata = {
                email: check.email,
                userName: check.userName,
                _id: check._id,
            }
            const email = req.body.email
            console.log("Email::: ", email);
            req.session.userdata = userdata;
            req.session.forgot = true
            req.session.email = email;
            console.log("EmailID: ", req.session.email)
            res.redirect("/user/otp-sent")
        }
        else {
            console.log(check);
            req.session.errmsg = "no email found"
            res.redirect("/user/forgot-pass");
        }
    } catch (err) {
        console.log(err);
        req.session.errmsg = "no email found"
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
async function OtpConfirmation(req, res) {
    if (req.session.forgot) {
        console.log(req.body);
        try {
            const email = req.session.email
            // console.log("forgot confirmation :", email);
            const Otp = await OTP.findOne({ email: email }, {})

            if (Date.now() > Otp.expireAt) {
                await OTP.deleteOne({ email: req.session.email });

            } else {
                const hashed = Otp.otp
                const match = await bcrypt.compare(req.body.code, hashed);
                if (match) {
                    req.session.logged = true;
                    req.session.forgot = false;
                    req.session.pass_reset = true
                    req.session.user = Otp.email
                    res.render("userView/resetPass", { title: "Reset password" });
                }
                else {
                    console.log("no match");
                    req.session.userdata = "";
                    res.render('userView/otplogin', { title: "Otp page", err: "Invalid OTP" })
                }
            }
        } catch (err) {
            console.log(err);
            req.session.errmsg = "Email not found";
        }
    }
    else if (req.session.signotp) {
        console.log("Sign up data..",req.body)
        try {
            const data = req.session.data;
            const dataplus = {
                userName: data.userName,
                email: data.email,
                password: data.password,
                status: "Active",
                timeStamp: Date.now()
            }
            console.log(req.session.data);
            const Otp = await OTP.findOne({ email: data.email })
            console.log(Otp.expireAt);
            if (Date.now() > Otp.expiredAt) {
                await OTP.deleteOne({ email });
            } else {
                const hashed = Otp.otp
                const match = await bcrypt.compare(req.body.code, hashed);
                if (match) {
                    console.log(data);

                    const result = await userCollection.create({ ...data, name: data.email })
                    req.session.logged = true;
                    req.session.signotp = false
                    req.session.user = data.userName;
                    req.session.email = data.email
                    const refferUserWallet= await userCollection.findByIdAndUpdate(
                        data.reffer,{
                            $inc:{'wallet.amount':250},
                            $push:{
                                'wallet.transactions': {
                                    amount:250,
                                    transactionType:'credit',
                                    timestamp: new Date(),
                                    description:"Refferal by user"
                                }
                            }
                        }
                    )
                    res.redirect("/user/home")

                }
                else {
                    // req.session.errmsg="Invalid OTP"
                    res.render('userView/otplogin', { title: "Otp page", err: "Invalid OTP" })
                }
            }


        } catch (err) {
            console.log(err);
            res.redirect("/user/otp")
        }
    }
}

//Reset password section
const get_password_reset = (req, res) => {
    if (req.session.pass_reset) {
        res.render("userView/resetPass", { title: "Reset password" });

    } else {
        res.redirect("/user/login-page")
    }
}

const password_reset = async (req, res) => {
    try {
        // console.log(req.body);
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

//User profile side
async function getUserprofile(req, res) {
    try {
        let user = req.session.user
        const UserData = await userCollection.findOne({ userName: user })
        // console.log("UserData..",UserData);
        res.render('userView/userProfile', { title: "Profile view", user, UserData})
    } catch (error) {
        console.log("can't profile details");
        res.render("errorView/404");
    }
}

//User profile picture
const postUserProfile = async (req, res) => {
    try {
      const userEmail = req.session.email;
    //   console.log("1",userEmail);
      const username = await userCollection.findOne({ email: userEmail });
    //   console.log("2",username);
      const userId = username._id;
    //   console.log("3",userId);
  
      if (!req.file) {
        console.error("No file uploaded");
        return res
          .status(400)
          .json({ success: false, error: "No file uploaded" });
      }
  
      const uploadedImage= req.file;
  
      const imageBuffer = fs.readFileSync(uploadedImage.path);
  
      const croppedImageBuffer = await sharp(imageBuffer)
      .resize({ width: 180, height: 180, fit: sharp.fit.cover })
      .toBuffer();
  
      const savePath = path.join(__dirname, '../public/profile-img/cropProfile-img');
      const fileName = uploadedImage.originalname;
    
      fs.writeFileSync(path.join(savePath, fileName), croppedImageBuffer);
  
      const updateUser = await userCollection.findOneAndUpdate(
        { _id: userId },
        { profilePhoto: fileName },
        { new: true }
      );
  
      if (updateUser) {
        return res
          .status(200)
          .json({
            success: true,
            message: "Profile picture uploaded successfully",
          });
      } else {
        return res.status(404).json({ success: false, error: "User not found" });
      }
    } catch (error) {
      console.error("Error while uploading profile picture:", error);
      return res
        .status(500)
        .json({ success: false, error: "Internal server error" });
    }
  };
//user Address book
async function getAddressBook(req, res) {
    try {
        let user = req.session.user
        const userAddressData = await userCollection.findOne({ userName: user })
        res.render('userView/userAddress', { title: "Address view", user, userAddressData })
    } catch (error) {
        console.log("can't add Address");
        res.render("errorView/404");
    }
}
// add address
const postAddress = async (req, res) => {
    try {
        let email = req.session.email
        // console.log(email);
        let data = {
            nameuser: req.body.nameuser,
            addressLine: req.body.addressLine,
            city: req.body.city,
            pincode: req.body.pincode,
            state: req.body.state,
            mobile: req.body.mobile
        }
        // console.log(data);
        const userAddress = await userCollection.findOne({ email: email })
        console.log(userAddress);
        userAddress.address.push(data)
        await userAddress.save()
        res.redirect('/user/AddressBook')
    } catch (error) {
        console.log("can't post Address");
        res.render("errorView/404");
    }
}


// //Edit address
async function postEditAddress(req,res){
    try{
        let id = req.params.id;
        // console.log("id:"+id);
        // let email = req.session.email
        // console.log(email);
        let data = {
            nameuser: req.body.nameuser,
            addressLine: req.body.addressLine,
            city: req.body.city,
            pincode: req.body.pincode,
            state: req.body.state,
            mobile: req.body.mobile
        }
        // console.log(data);
        const user=await userCollection.findOneAndUpdate(
            {'address._id':id},
            {$set:{'address.$':data}},
            {new:true}
        )
        if(user){
            res.redirect('/user/AddressBook')
        }
 
    }catch (error) {
        console.log("can't post Address");
        res.render("errorView/404");
    }
}

//Delete address
async function getDeleteAddress(req, res) {
    try{
        let email = req.session.email
        // console.log(email);
        let id = req.params.id
        // console.log(id);
        const data = await userCollection.findOne({ email: email })
        await userCollection.updateOne({_id:new ObjectId(data._id)},{
            $pull:{
                address:{_id:new ObjectId(id)}
            }
        })
        console.log("delete:" + data);
        res.redirect('/user/AddressBook')
    }catch(error){
        console.log("reached:"+error);
        res.render("errorView/404");
    }
}

//User coupons
async function getUserCoupons(req,res){
    try{
        let user=req.session.user
        const couponData = await couponCollection.find().sort()
        res.render('userView/userCoupons',{title:"Coupons",user,couponData})
    }catch(error){
        console.log("coupon cahnge:"+error);
        res.render("errorView/404");
    }
}

//User wallet history
async function getWalletHistory(req,res){
    try{
        // console.log("Wallet reached");
        let user=req.session.user
        let email=req.session.email
        let userData=await userCollection.findOne({email:email})
        console.log("userData>>>>>",userData);
        userData.wallet.transactions.sort((a,b)=>b.timestamp - a.timestamp)
        res.render('userView/userWalletHistory',{title:"Wallet History",user,userData})
    }catch(error){
        console.log("coupon cahnge:"+error);
        res.render("errorView/404");
    }
}
//User change password
async function getChangepass(req,res){
    try{
        let user=req.session.user
        // let email=req.session.email
        // console.log("pass:",email);
        res.render('userView/ChangePass',{title:"Change password",user,err:false,success:false})
    }catch(error){
        console.log("Pass cahnge:"+error);
        res.render("errorView/404");
    }
}

async function postChangepass(req, res) {
    try {
        if (!req.session.user || !req.session.email) {
            throw new Error("User session data is missing.");
        }

        let user = req.session.user;
        let email = req.session.email;
        let oldPassword = req.body.oldPassword;
        let newPassword = req.body.newPassword;
        let confirmPassword = req.body.confirmPassword;
        const check = await userCollection.findOne({ email: email }, {});

        if (check) {
            let isMatch = await bcrypt.compare(oldPassword, check.password);
            if (isMatch && newPassword === confirmPassword) {
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                await userCollection.updateOne({ email: email }, { $set: { password: hashedPassword } });
                console.log("Password updated successfully");

                res.json({ success: "Password updated successfully", err: null });
            } else {
                console.log("Old password is not a match");
                res.json({ err: "Old password is not a match", success: null });            }
        } else {
            console.log("User not found");
            res.status(404).json({ success: null, err: "User not found" });
        }
    } catch (error) {
        console.error("Password change error:", error);
        res.status(500).json({ success: null, err: "Internal server error" });
    }
}


//Logout
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            res.send('Error');
        } else {
            res.redirect('/');
        }
    });
}

module.exports = {
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
    postUserProfile,
    getAddressBook,
    postAddress,
    postEditAddress,
    // getEditAddress,
    getDeleteAddress,
    getUserCoupons,
    getWalletHistory,
    getChangepass,
    postChangepass,
    logout
}