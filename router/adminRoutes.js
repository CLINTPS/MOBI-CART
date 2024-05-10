const router=require('express').Router();
const uplode = require('../middleware/multer')
const bannerUplode = require('../middleware/bannerMulter')
const adminAuth = require('../middleware/adminAuth')
const adminControl = require('../controller/adminControl')
const categoryControl = require('../controller/categoryControl')
const productControl = require('../controller/productControl')
const brandControl = require('../controller/brandControl')
const adminOrderControl = require('../controller/adminOrderControl')
const bannerControl = require('../controller/bannerControl')
const couponsControl = require('../controller/couponsControl')
const returnOrder = require('../controller/returnOrderControl')
const offerControl = require('../controller/offerControl')


//admin
router.get("/",adminAuth.adminExist,adminControl.getAdminpage);
router.post('/',adminAuth.adminExist,adminControl.postAdminpage);

// admin Log-out
router.get('/adLogout', adminControl.adminLogout);

//Admin user control
router.get('/userDetails',adminAuth.verifyAdmin,adminControl.userdetails)
router.post('/searchCustomer',adminAuth.verifyAdmin,adminControl.userSerch)
router.get('/block/:id',adminAuth.verifyAdmin,adminControl.UserStatus)

//Dash board
router.get('/dashboard',adminAuth.verifyAdmin,adminControl.getDashboard)
router.get('/latestOrders',adminAuth.verifyAdmin,adminControl.getlatestOrders)
router.get('/Orders-By-day',adminAuth.verifyAdmin,adminControl.getSalesGraph)
router.get('/Orders-By-month',adminAuth.verifyAdmin,adminControl.getSalesGraph)
router.get('/Orders-By-year',adminAuth.verifyAdmin,adminControl.getSalesGraph)
//Sales report
router.post('/SalesReport',adminAuth.verifyAdmin,adminControl.postSalesReport)


//product

const uploadFields = [
    { name: "main", maxCount: 1 },
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount:1},
];


router.get('/productPage',adminAuth.verifyAdmin,productControl.getProductPage)
router.get('/add-productPage',adminAuth.verifyAdmin,productControl.getProductdata)
router.post('/add-productPage',uplode.fields(uploadFields),productControl.postProductdata)
router.get('/edit-product/:id',adminAuth.verifyAdmin,productControl.getProductedit)
router.post('/update-productPage/:id',uplode.fields(uploadFields),productControl.postProductedit)
router.get('/delete-product/:id',adminAuth.verifyAdmin,productControl.getProductDelete)
router.get('/productblock/:id',adminAuth.verifyAdmin,productControl.getBlockProduct)
router.post('/searchProduct',adminAuth.verifyAdmin,productControl.serchProduct)
router.delete('/delete-image/:id/:index', adminAuth.verifyAdmin, productControl.deleteImage);

//category
router.get('/category',adminAuth.verifyAdmin,categoryControl.getCategory)
router.get('/add-category',adminAuth.verifyAdmin,categoryControl.getCatagoriesData)
router.post('/add-category',adminAuth.verifyAdmin,categoryControl.postCatagoriesData)
router.get('/edit-category/:id',adminAuth.verifyAdmin,categoryControl.getCatagoriesedit)
router.post('/upadte-catogory/:id',adminAuth.verifyAdmin,categoryControl.postCatagoriesedit)
router.get('/delete-category/:id',adminAuth.verifyAdmin,categoryControl.getCategoryDelete)
//Brand
router.get('/brand',adminAuth.verifyAdmin,brandControl.getBrand)
router.get('/add-brand',adminAuth.verifyAdmin,brandControl.getbrandsData)
router.post('/add-brand',adminAuth.verifyAdmin,brandControl.postbrandsData)
router.get('/edit-brand/:id',adminAuth.verifyAdmin,brandControl.getBrandedit)
router.post('/update-brand/:id',adminAuth.verifyAdmin,brandControl.postBrandedit)
router.get('/delete-brand/:id',adminAuth.verifyAdmin,brandControl.getBrandDelete)

//Order control
router.get('/OrderControl',adminAuth.verifyAdmin,adminOrderControl.getOrderDetails)
router.put('/updateOrderStatus/:orderId',adminAuth.verifyAdmin,adminOrderControl.putUpdateStatus)
router.get('/orders/details/:orderId',adminAuth.verifyAdmin,adminOrderControl.getViewOrder)

//Return Orders
router.get('/ReturnOrder',adminAuth.verifyAdmin,returnOrder.getReturnOrder)
router.put('/acceptReturn/:orderId',adminAuth.verifyAdmin,returnOrder.putAcceptReturn)
router.put('/cancelReturn/:orderId',adminAuth.verifyAdmin,returnOrder.putCancelReturn)

//Banner
router.get('/Banner',adminAuth.verifyAdmin,bannerControl.getBanner)
router.post('/bannerUpdation',adminAuth.verifyAdmin,bannerUplode.single('image'),bannerControl.postNewBanner)

//Coupons
router.get('/Coupons',adminAuth.verifyAdmin,couponsControl.getCouponView)
router.post('/CreateCoupon',adminAuth.verifyAdmin,couponsControl.postCreateCoupon)
router.get('/deleteCoupon/:id',adminAuth.verifyAdmin,couponsControl.getDeleteCoupon)
router.get('/editCoupon/:id',adminAuth.verifyAdmin,couponsControl.getEditCoupon)
router.post('/EditCoupon',adminAuth.verifyAdmin,couponsControl.postEditCoupon)

//Offers
router.get('/categoryOffer',adminAuth.verifyAdmin,offerControl.getOfferPage)
router.post('/addCategoryOffer',adminAuth.verifyAdmin,offerControl.postaddCategoryOffer)
router.delete('/deleteOffer/:offerId',adminAuth.verifyAdmin,offerControl.deleteOffer)
router.get('/editCategoryOffer/:id',adminAuth.verifyAdmin,offerControl.editOffer)
router.post('/edit-offer',adminAuth.verifyAdmin,offerControl.postEditOffer)

module.exports  = router;