const router=require('express').Router();

const {
    getAdminpage,
    postAdminpage,
    adminLogout,
}=require("../controller/adminControl");
router.get("/",getAdminpage);
router.post('/adminlogin',postAdminpage)
router.get("/adLogout", adminLogout);

module.exports  = router;