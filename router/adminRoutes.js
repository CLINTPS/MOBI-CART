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
    getCatagoriesedit,
    postCatagoriesedit,
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
router.get('/edit-category/:id',getCatagoriesedit)
router.post('/upadte-catogory/:id',postCatagoriesedit)

//product
const {
    getProductPage,
    getProductdata,
    postProductdata,
    getProductedit,
    postProductedit,
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
router.get('/edit-product/:id',getProductedit)
router.post('/update-productPage/:id',uplode.fields(uploadFields),postProductedit)


//Brand
const {
    getBrand,
    getbrandsData,
    postbrandsData,
    getBrandedit,
    postBrandedit
} = require('../controller/brandControl')
router.get('/brand',getBrand)
router.get('/add-brand',getbrandsData)
router.post('/add-brand',postbrandsData)
router.get('/edit-brand/:id',getBrandedit)
router.post('/update-brand/:id',postBrandedit)

module.exports  = router;