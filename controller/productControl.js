const productsCollections = require ('../model/product')
const categoriesCollection=require('../model/categories')
const brandCollection = require('../model/brand');
const { ObjectId } = require('mongodb');

//dashboard to product details
async function getProductPage(req,res){
    try{ 
          var i=0
          const page = parseInt(req.query.page) || 1;
          const productDataCount = await productsCollections.find().count()
          const pageSize = 3;
          const totalOrder = Math.ceil(productDataCount / pageSize);
          const skip = (page - 1) * pageSize;
          const productData = await productsCollections.find().sort({ updatedAt: -1 }).skip(skip).limit(pageSize);
          console.log(productData);
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
        try{
            let id = req.params.id
            console.log(id);
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
        console.log("asss", productDetails);

        const files = req.files;    

        const date = Date.now();

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
            updateData.images[0] = ProductData.images[0]; // Use the existing image if not updated
        }

        // Handle additional images (image1, image2, image3)
        for (let i = 1; i <= 3; i++) {
            const imageName = `image${i}`;
            if (files && files[imageName]) {
                updateData.images[i] = files[imageName][0].filename;
            } else {
                updateData.images[i] = ProductData.images[i]; // Use the existing image if not updated
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

async function serchProduct(req,res){
    try{
        var i = 0;
        const data = req.body.search; 
        console.log(data);
        const page = parseInt(req.query.page) || 1;
        const productDataCount = await productsCollections.find().count()
        const pageSize = 3;
              const totalOrder = Math.ceil(productDataCount / pageSize);
              const skip = (page - 1) * pageSize;
        let productData = await productsCollections.find({
            ProductName: { $regex: "^" + data, $options: "i" },
    }).skip(skip).limit(pageSize);;

    if(productDataCount.length===0){
        const productData = await productsCollections.find({});
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
        console.log("product id",productId);
        const imageIndex = req.params.index;
        console.log("image index",imageIndex);
        
        // Retrieve the product data
        const product = await productsCollections.findById(productId);
        console.log("Product",product);
        if (!product) {
            // Product not found, handle the error
            res.status(404).send('Product not found');
            return;
        }
        
        // Delete the image file from the server (you need to implement this)
        // You can use the fs module to delete the image from the file system.
        // For example: fs.unlink(`path/to/images/${product.images[imageIndex]}`, (err) => { ... });

        // Remove the image from the product's images array
        product.images.splice(imageIndex, 1);
        
        // Save the updated product data
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