const router=require('express').Router();

const {
    getAdminpage,
    postAdminpage,
    adminLogout,
    userdetails,
    UserStatus,
    getProduct,
}=require("../controller/adminControl");
router.get("/",getAdminpage);
router.post('/adminlogin',postAdminpage)
router.get("/adLogout", adminLogout);
router.get('/userDetails',userdetails)
router.get('/block/:id',UserStatus)
router.get('/productPage',getProduct)
module.exports  = router;