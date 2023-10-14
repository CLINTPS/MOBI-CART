const router=require('express').Router();
const uplode = require('../middleware/multer')


const {
    getAdminpage,
    postAdminpage,
    adminLogout,
    userdetails,
    UserStatus,
    getCategory,
    getCatagoriesData,
    postCatagoriesData,
}=require("../controller/adminControl");


router.get("/",getAdminpage);
//admin
router.post('/adminlogin',postAdminpage)
router.get("/adLogout", adminLogout);
//useres
router.get('/userDetails',userdetails)
router.get('/block/:id',UserStatus)
//category
router.get('/category',getCategory)
router.get('/add-category',getCatagoriesData)
router.post('/add-category',postCatagoriesData)

//product
const {
    getProductPage,
    getProductdata,
    postProductdata
}=require('../controller/productControl')

const uploadFields = [
    { name: "main", maxCount: 1 },
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount:1},
];

router.get('/productPage',getProductPage)
router.get('/add-productPage',getProductdata)
router.post('/add-productPage',uplode.fields(uploadFields),postProductdata)

//Brand
const {
    getBrand,
    getbrandsData,
    postbrandsData,
} = require('../controller/brandControl')
router.get('/brand',getBrand)
router.get('/add-brand',getbrandsData)
router.post('/add-brand',postbrandsData)

module.exports  = router;