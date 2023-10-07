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
        res.render('./adminView/adiminLog', { title: "admin paage", err: "Invalid Username or Password" })
    }
}
function adminLogout(req,res){
   res.render('adminView/adminLog',{title: "admin paage"})
}

module.exports={
    getAdminpage,
    postAdminpage,
    adminLogout
}