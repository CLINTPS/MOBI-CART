const userCollection=require('../model/user')

function getAdminpage(req, res) {
    res.render('./adminView/adminLog',{title:"admin-login"})
}

//Admin password and user id
const credential = {
    email: "clint@gmail.com",
    password: "000"
}

//Admin login to admin view page

function postAdminpage(req, res){
    if (req.body.email == credential.email && req.body.password == credential.password) {
        req.session.admin = req.body.email;
        req.session.logged = true
        req.session.adminLogin = true
        console.log("logined");
        // res.redirect('/dashboard')
        res.render("adminView/dashboard",{title:"Admin Dashboard"})
    } else {
        res.render('adminView/adminLog', { title: "admin paage", err: "Invalid Username or Password" })
    }
}

//dashboard to coustomer details
async function  userdetails (req, res){
    if (req.session.adminLogin) {
        var i = 0;
        const useData = await userCollection.find();
        res.render('adminView/customers',{title:"coustome details",useData,i})
    } else {
        res.redirect("/admin/userDetails");
    }
};

//user block unblock
const UserStatus = async (req, res) => {
    const id = req.params.id;
    console.log("Recieve request "+id);

    // Find the user by ID
    const user = await userCollection.findOne({ _id: id });

    if (!user) {
        return res.status(404).send("User not found");
    }
    const newStatus = !user.status;
    await userCollection.updateOne(
        { _id: id },
        { $set: { status: newStatus } }
    );

    console.log(`User ${user.userName} is ${newStatus ? "unblocked" : "blocked"}`);
    res.redirect("/admin/userDetails");
};

//admin logout
function adminLogout(req,res){
   res.render('adminView/adminLog',{title: "admin page"})
}

//dashboard to product details
function getProduct(req,res){
    res.render('adminView/products',{title:"Product control"})
}

module.exports={
    getAdminpage,
    postAdminpage,
    adminLogout,
    userdetails,
    UserStatus,
    getProduct
}