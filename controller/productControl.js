const productsCollections = require ('../model/product')
const categoriesCollection=require('../model/categories')
const brandCollection = require('../model/brand')

//dashboard to product details
function getProductPage(req,res){
    res.render('adminView/products',{title:"Product Details"})
}
//add get product
async function getProductdata(req,res){
    if(req.session.adminLogin){
        const categoryData = await categoriesCollection.find({});
        const brandData = await brandCollection.find({});

        res.render('adminView/add-products',{title:"add new products",categoryData,brandData})
    }else{
        res.redirect('/admin')
    }
}

//add post product
// async function postProductdata(req,res){
  //   try {
  //     const { ProductName } = req.body;
  //     console.log(ProductName);
  
  //     const newProduct = new productsCollections({
  //       name: ProductName,
  //       timeStamp: new Date(),
  //     });
  
  //     const insertResult = await productsCollections.insertMany([newProduct]);
  //     res.redirect('/admin/add-productPage');
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).send('Internal Server Error');
  //   }
  // }

  //add post product
async function postProductdata(req,res) {
    const productDetails = req.body;
    try {
        const files = req?.files;

        if (files && files.main && files.main[0] && files.image1 && files.image1[0] && files.image2 && files.image2[0] && files.image3 && files.image3[0]) {
            const ret = [
                files.main[0].filename,
                files.image1[0].filename,
                files.image2[0].filename,
                files.image3[0].filename,
            ];

            const uploaded = await productsCollections.create({
                ...productDetails,
                images: ret,
            });

            if (uploaded) {
                console.log('Product added');
                res.redirect('/admin/add-productPage');
            }
        } else {
            console.log('One or more files are missing.');
        }
    } catch (error) {
        console.log('An error happened');
        throw error;
  }
};

  module.exports ={
    getProductPage,
    getProductdata,
    postProductdata,
  }