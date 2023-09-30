const router=require('express').Router();

const {
    getloginpage
}=require("../controller/userControl")
router.get('/',getloginpage);

module.exports = router;