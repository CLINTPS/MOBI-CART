const userCollection=require('../model/user')


//Admin password and user id
const credential = {
    email: "clint@gmail.com",
    password: "12345678"
}

//admin page
function getAdminpage(req, res) {
        res.render('adminView/adminLog',{title:"admin-login"})
}

//Admin login to admin view page

function postAdminpage(req, res){
    try{
        if (req.body.email == credential.email && req.body.password == credential.password) {
            req.session.admin = req.body.email;
            // req.session.logged = true
            req.session.adminLogin = true
            console.log("logined");
            // res.redirect('/dashboard')
            res.render("adminView/dashboard",{title:"Admin Dashboard"})
        } else {
            res.render('adminView/adminLog', { title: "admin page", err: "Invalid Username or Password" })
        }
    }catch(error){
        console.log("Error 1:"+error);
    }
}
// TO dashboard
function getDashboard (req,res){
    try{
        res.render('adminView/dashboard',{title:"admin-Dashboard"})
    }catch(error){

        res.render("errorView/404admin");
    }
}

//To coustomer details
async function  userdetails (req, res){
    try{
        var i = 0;
        const useData = await userCollection.find({});
        useData.forEach(data => {
            data.createdAt = new Date(data.createdAt);
        });
        // console.log(useData);
        res.render('adminView/customers',{title:"coustome details",useData,i})
    }catch(error){

        res.render("errorView/404admin");
    }
};

//User serch
async function userSerch(req,res){
    try{
        var i = 0;
        const data = req.body.search; 
        console.log(data);
        let useData = await userCollection.find({
            userName: { $regex: "^" + data, $options: "i" },
    });
    useData.forEach(data => {
        data.createdAt = new Date(data.createdAt);
    });
    console.log(`Search Data ${useData} `);
    res.render('adminView/customers',{title:"coustome details",useData,i})
    }catch(error){

        res.render("errorView/404admin");
    }
}

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
    req.session.destroy((err)=>{
        if(err){
            console.log(err);
            res.send('Error')
        }else{
            res.redirect('/admin')
        }
    })
}




module.exports={
    getAdminpage,
    postAdminpage,
    adminLogout,
    userdetails,
    UserStatus,
    userSerch,
    getDashboard
}