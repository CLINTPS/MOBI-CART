const productsCollections = require('../model/product')
const categoriesCollection = require('../model/categories')
const brandCollection = require('../model/brand')


//get product details page
async function getProducDetails(req,res){
        try{
            console.log("product details reached");
            const ProductID = req.params.id;
            console.log(ProductID);
            const productData = await productsCollections.findById(ProductID);
            console.log('product view reached');
            let user = req.session.user
            res.render('userView/product-Details',{title:"product details",user,productData})
        }catch(error){
            res.status(500).send('Internal server error')
        }
}

//get all product
async function getAllProducts(req,res){
    try{
        console.log("all product");
        let user = req.session.user
        console.log(user);
        const brandData = await brandCollection.find({})
        const productData = await productsCollections.find({});
        console.log(productData);   
        res.render('userView/product-Full-Details',{title:"All product",user,productData,brandData})
    }catch(error){
        res.status(500).send('Internal server error')
    }
}

module.exports={
    getProducDetails,
    getAllProducts
}
