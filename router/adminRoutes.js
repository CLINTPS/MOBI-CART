const router=require('express').Router();

const {
    getAdminpage
}=require("../controller/adminControl");
router.get("/",getAdminpage);

module.exports  = router;