const productsCollections = require ('../model/product')
const categoriesCollection=require('../model/categories')
const brandCollection = require('../model/brand');
const { ObjectId } = require('mongodb');
const moment = require('moment-timezone');
const sharp = require('sharp')

//dashboard to product details
async function getProductPage(req,res){
    try{ 
          var i=0
          const page = parseInt(req.query.page) || 1;
          const pageSize = 4;

          const productDataCount = await productsCollections.find().count()
          const totalOrder = Math.ceil(productDataCount / pageSize);
          
          const skip = (page - 1) * pageSize;
          const productData = await productsCollections.find().sort({ createdAt: -1 }).skip(skip).limit(pageSize);
        //   console.log(productData);
          res.render('adminView/products',{title:"Product Details",
          i,
          productData,
          productDataCount:totalOrder,
          page: page
        })
    }catch(err){
        console.log(err);
        res.render('errorView/404admin')
      }
}
//add get product
async function getProductdata(req,res){
    try{
        const categoryData = await categoriesCollection.find({});
        const brandData = await brandCollection.find({});
        res.render('adminView/add-products',{title:"add new products",categoryData,brandData})
    }catch(err){
        console.log(err);
        res.render('errorView/404admin')
      }

}


//add post product
async function postProductdata(req, res) {
    const productDetails = req.body;

    try {
        const files = req?.files;
        const uploadedImages = [];

        if (files && files.main) {
            uploadedImages.push(files.main[0].filename);
        }

        // Check and add the other images
        for (let i = 1; i < 4; i++) {
            const imageName = `image${i}`;
            if (files && files[imageName]) {
                uploadedImages.push(files[imageName][0].filename);
            }
        }

        // Update productDetails with the images array
        productDetails.images = uploadedImages;

        const uploaded = await productsCollections.create(productDetails);

        if (uploaded) {
            console.log('Product added');
            res.redirect('/admin/add-productPage');
        }
    } catch (error) {
        console.log('An error happened');
        throw error;
    }
}

//edit get product
async function getProductedit(req,res){
        try{
            let id = req.params.id
            // console.log(id);
            const ProductData = await productsCollections.findById(id);
            if(!ProductData){
                console.log("ProductData not found");
                return res.render('errorView/404admin')
            }
            const categoryData = await categoriesCollection.find({});
            const brandData = await brandCollection.find({});
            res.render('adminView/edit-products',{title:"add new products",categoryData,brandData,ProductData})
        }catch(err){
            res.render.err=true
            res.render('errorView/404admin')
        }

}
//edit post product
async function postProductedit(req, res) {
    try {
        let id = req.params.id;
        const productDetails = req.body;
        console.log("productDetails::", productDetails);

        const files = req.files;    

        const date = moment().format();

        const ProductData = await productsCollections.findById(id);
            if(!ProductData){
                console.log("ProductData not found");
                return res.render('errorView/404admin')
            }

        const updateData = {
            ProductName: req.body.ProductName,
            Description: req.body.Description,
            Specification1: req.body.Specification1,
            Specification2: req.body.Specification2,
            Specification3: req.body.Specification3,
            Specification4: req.body.Specification4,
            Price: req.body.Price,
            DiscountAmount: req.body.DiscountAmount,
            AvailableQuantity: req.body.AvailableQuantity,
            Category: req.body.Category,
            BrandName:req.body.BrandName,
            timeStamp: date,
            images: [] 
        };

        // Handle main image
        if (files && files.main) {
            updateData.images[0] = files.main[0].filename;
        } else {
            updateData.images[0] = ProductData.images[0];
        }

        // Handle additional images (image1, image2, image3)
        for (let i = 1; i <= 3; i++) {
            const imageName = `image${i}`;
            if (files && files[imageName]) {
                updateData.images[i] = files[imageName][0].filename;
            } else {
                updateData.images[i] = ProductData.images[i];
            }
        }

        const uploaded = await productsCollections.updateOne({ _id: id }, { $set: updateData });

        if (uploaded) {
            console.log('Product updated');
            res.redirect('/admin/productPage');
        } else {
            console.log('Failed to update product');
        }
    } catch (error) {
        console.log('An error happened');
        throw error;
    }
}




//Delete product
async function getProductDelete(req,res){
    try{
        const id = req.params.id
        // console.log(id);
        await productsCollections.deleteOne({_id:id})
        res.redirect('/admin/productPage')
    }catch(err){
        console.log(err);
        res.render('errorView/404admin')
      }
}

//Block Product
async function getBlockProduct(req,res){
    try{
        const id = req.params.id
        // console.log(id);
        const data= await productsCollections.findOne({_id:id})
        if(data.Status===true){
            await productsCollections.updateOne({_id:id},{$set:{Status:false}})
        }else{
            await productsCollections.updateOne({_id:id},{$set:{Status:true}})
    
        }
        res.redirect('/admin/productPage')
    }catch(err){
        console.log(err);
        res.render('errorView/404admin')
      }
}

//Serch product
async function serchProduct(req,res){
    try{
        var i = 0;
        const data = req.body.search; 
        // console.log(data);
        const page = parseInt(req.query.page) || 1;
        const productDataCount = await productsCollections.find().count()
        const pageSize = 4;
              const totalOrder = Math.ceil(productDataCount / pageSize);
              const skip = (page - 1) * pageSize;
        let productData = await productsCollections.find({
            ProductName: { $regex: "^" + data, $options: "i" },
    }).sort({ createdAt: -1 }).skip(skip).limit(pageSize);

    if(productData.length===0){
        var i=0
        const page = parseInt(req.query.page) || 1;
        const pageSize = 4;

        const productDataCount = await productsCollections.find().count()
        const totalOrder = Math.ceil(productDataCount / pageSize);
        
        const skip = (page - 1) * pageSize;
        const productData = await productsCollections.find().sort({ createdAt: -1 }).skip(skip).limit(pageSize);
        // console.log(productData);
        res.render('adminView/products',{title:"Product Details",
        i,
        productData,
        productDataCount:totalOrder,
        page: page
      })
    }else{
        console.log(`Search Data ${productDataCount} `);
        const successMessage = req.query.successMessage || '';
        const errorMessage = req.query.errorMessage || '';
        res.render('adminView/products',{title:"Product Details",
        productData,
        productDataCount:totalOrder,
        i, 
        successMessage, 
        errorMessage,
        page: page
     });
    }
    }catch(error){

        res.render("errorView/404admin");
    }
}

//Delete one image
async function deleteImage(req, res) {
    try {
        const productId = req.params.id;
        // console.log("product id::",productId);
        const imageIndex = req.params.index;
        // console.log("image index ::",imageIndex);
        
        const product = await productsCollections.findById(productId);
        // console.log("Product",product);
        if (!product) {
            res.status(404).send('Product not found');
            return;
        }

        product.images.splice(imageIndex, 1);
        
        await product.save();
        
        res.status(200).send('Image deleted successfully');
        
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).send('Failed to delete image');
    }
}

  module.exports ={
    getProductPage,
    getProductdata,
    postProductdata,
    getProductedit,
    postProductedit,
    getProductDelete,
    getBlockProduct,
    serchProduct,
    deleteImage
  }