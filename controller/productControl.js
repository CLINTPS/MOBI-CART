const productsCollections = require ('../model/product')
const categoriesCollection=require('../model/categories')
const brandCollection = require('../model/brand')

//dashboard to product details
async function getProductPage(req,res){
    if(req.session.adminLogin){
      var i=0
      const productData = await productsCollections.find({});
      res.render('adminView/products',{title:"Product Details",productData,i})
    }else{
      res.redirect('/admin')
    }
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
async function postProductdata(req,res) {
    const productDetails = req.body;
    try {
        const files = req?.files;

        if (files && files.main) {
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