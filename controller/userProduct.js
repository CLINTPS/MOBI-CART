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
            res.render("errorView/404");
        }
}

//get all product
async function getAllProducts(req,res){
    try{
        // console.log("all product");
        let user = req.session.user
        // console.log(user);
        const brandData = await brandCollection.find({})
        const categoryData = await categoriesCollection.find({})
        const page = parseInt(req.query.page) || 1;
        const productDataCount = await productsCollections.find().count()
        const pageSize = 4;
        const totalProducts = Math.ceil(productDataCount / pageSize);
        const skip = (page - 1) * pageSize;
        const productData = await productsCollections.find().skip(skip).limit(pageSize); 
        res.render('userView/product-Full-Details',{title:"All product",
                user,
                brandData,
                categoryData,
                productData,
                productDataCount : totalProducts,
                page: page
            })
    }catch(error){
        res.status(500).send('Internal server error')
        res.render("errorView/404");
    }
}

//Filter products
async function postFilterProduct(req, res) {
    try {
        const { selectedBrands, selectedCategory, selectedPrice } = req.body;
        let user = req.session.user;
        const brandData = await brandCollection.find({});
        const categoryData = await categoriesCollection.find({});
        const page = parseInt(req.query.page) || 1;
        const pageSize = 4;
        const skip = (page - 1) * pageSize;

        const filter = {};
        if (selectedBrands) {
            filter.BrandName = selectedBrands;
        }
        if (selectedCategory) {
            filter.Category = selectedCategory;
        }
        if (selectedPrice) {

            const priceValue = parseInt(selectedPrice);
            
            let priceRange;
            if (priceValue <= 20000) {
                priceRange = { $gte: 0, $lt: 20000 };
            } else if (priceValue <= 30000) {
                priceRange = { $gte: 20001, $lt: 30000 };
            } else if (priceValue <= 50000) {
                priceRange = { $gte: 30001, $lt: 50000 };
            } else if (priceValue <= 100000) {
                priceRange = { $gte: 50001, $lt: 100000 };
            } else if (priceValue <= 200000) {
                priceRange = { $gte: 100001, $lt: 200000 };
            }

            filter.DiscountAmount = priceRange;
        }

        const productData = await productsCollections.find(filter).skip(skip).limit(pageSize);
        const productDataCount = await productsCollections.countDocuments(filter);

        const totalProducts = Math.ceil(productDataCount / pageSize);
        console.log("productData ::",productData);
        res.render('userView/product-Full-Details', {
            title: "All product",
            user,
            brandData,
            categoryData,
            productData,
            productDataCount: totalProducts,
            page: page
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
        res.render("errorView/404");
    }
}

//Serch product all page
async function postSerchAllProduct(req,res){
    try{
        let SerchProduct=req.body.searchAllProduct
        console.log("SerchProduct:",SerchProduct);
        let user = req.session.user
        console.log(user);
        const brandData = await brandCollection.find({})
        const categoryData = await categoriesCollection.find({})

        const page = parseInt(req.query.page) || 1;
        const productDataCount = await productsCollections.find({
            ProductName: { $regex: "^" + SerchProduct, $options: "i" },
        }).count()

        const pageSize = 2;
        const totalProducts = Math.ceil(productDataCount / pageSize);
        const skip = (page - 1) * pageSize;

        const productData = await productsCollections.find({
            ProductName: { $regex: "^" + SerchProduct, $options: "i" },
        }).skip(skip).limit(pageSize); 

        res.render('userView/product-Full-Details',{title:"All product",
                user,
                brandData,
                categoryData,
                productData,
                productDataCount : totalProducts,
                page: page
            })
    }catch(error){
        res.status(500).send('Internal server error')
        res.render("errorView/404");
    }

}

module.exports={
    getProducDetails,
    getAllProducts,
    postFilterProduct,
    postSerchAllProduct
}
