const productsCollections = require ('../model/product')
const categoriesCollection=require('../model/categories')
const brandCollection = require('../model/brand');
const { ObjectId } = require('mongodb');

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

//edit get product
async function getProductedit(req,res){
    if(req.session.adminLogin){
        try{
            let id = req.params.id
            console.log(id);
            const categoryData = await categoriesCollection.find({});
            const brandData = await brandCollection.find({});
            const ProductData = await productsCollections.findOne({_id:id});
            // console.log(ProductData);
            res.render('adminView/edit-products',{title:"add new products",categoryData,brandData,ProductData})
        }catch(err){
            res.render.err=true
            res.redirect('/admin/404')
        }
    }else{
        res.redirect('/admin/productPage')
    }
}
//edit post product
async function postProductedit(req,res) {
    try {
        const productDetails = req.body;
        console.log(productDetails);
        let id = req.params.id  

        const files = req?.files;

        if (files && files.main) {
            const ret = [
                files.main[0].filename,
                files.image1[0].filename,
                files.image2[0].filename,
                files.image3[0].filename,
            ];
            const date=Date.now();
            const uploaded = await productsCollections.updateOne({_id:id},{
                $set:{
                    ProductName:req.body.ProductName,
                    Description:req.body.Description,
                    Specification1:req.body.Specification1,
                    Specification2:req.body.Specification2,
                    Specification3:req.body.Specification3,
                    Specification4:req.body.Specification4,
                    Price:req.body.Price,
                    DiscountAmount:req.body.DiscountAmount,
                    AvailableQuantity:req.body.AvailableQuantity,
                    Category:req.body.Category,
                    images: ret,
                    timeStamp:date
                }
            });

            if (uploaded) {
                console.log('Product updated');
                res.redirect('/admin/productPage');
            }
        } else {
            console.log('One or more files are missing.');
        }
    } catch (error) {
        console.log('An error happened');
        throw error;
  }
};

//Delete product
async function getProductDelete(req,res){
    const id = req.params.id
    console.log(id);
    await productsCollections.deleteOne({_id:id})
    res.redirect('/admin/productPage')
}

  module.exports ={
    getProductPage,
    getProductdata,
    postProductdata,
    getProductedit,
    postProductedit,
    getProductDelete
  }