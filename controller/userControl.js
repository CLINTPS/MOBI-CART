function getloginpage(req,res){
    res.render("./userView/index",{title:"user-login",err:false})
}

module.exports={
    getloginpage
}