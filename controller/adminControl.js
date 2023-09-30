function getAdminpage(req, res) {
    res.render('./adminView/adminLog',{title:"admin-login"})
}

module.exports={
    getAdminpage
}