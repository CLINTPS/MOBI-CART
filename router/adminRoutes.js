const router=require('express').Router();
const uplode = require('../middleware/multer')


const {
    getAdminpage,
    postAdminpage,
    adminLogout,
    userdetails,
    UserStatus,
}=require("../controller/adminControl");

//admin
router.get("/",getAdminpage);
router.post('/adminlogin',postAdminpage);
router.get("/adLogout", adminLogout);
//useres
router.get('/userDetails',userdetails)
router.get('/block/:id',UserStatus)

//category
const{
    getCategory,
    getCatagoriesData,
    postCatagoriesData,
    getCatagoriesedit,
    postCatagoriesedit,
    getCategoryDelete
}=require('../controller/categoryControl')

router.get('/category',getCategory)
router.get('/add-category',getCatagoriesData)
router.post('/add-category',postCatagoriesData)
router.get('/edit-category/:id',getCatagoriesedit)
router.post('/upadte-catogory/:id',postCatagoriesedit)
router.get('/delete-category/:id',getCategoryDelete)

//product
const {
    getProductPage,
    getProductdata,
    postProductdata,
    getProductedit,
    postProductedit,
    getProductDelete,
    getBlockProduct
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
router.get('/delete-product/:id',getProductDelete)
router.get('/productblock/:id',getBlockProduct)

//Brand
const {
    getBrand,
    getbrandsData,
    postbrandsData,
    getBrandedit,
    postBrandedit,
    getBrandDelete
} = require('../controller/brandControl')

router.get('/brand',getBrand)
router.get('/add-brand',getbrandsData)
router.post('/add-brand',postbrandsData)
router.get('/edit-brand/:id',getBrandedit)
router.post('/update-brand/:id',postBrandedit)
router.get('/delete-brand/:id',getBrandDelete)

module.exports  = router;