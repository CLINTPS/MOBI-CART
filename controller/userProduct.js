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
        console.log("all product");
        let user = req.session.user
        console.log(user);
        const brandData = await brandCollection.find({})
        const categoryData = await categoriesCollection.find({})
        const page = parseInt(req.query.page) || 1;
        const productDataCount = await productsCollections.find().count()
        console.log("qqqqqqq",productDataCount);
        const pageSize = 2;
        const totalProducts = Math.ceil(productDataCount / pageSize);
        console.log("wwwww",totalProducts);  
        const skip = (page - 1) * pageSize;
        const productData = await productsCollections.find().skip(skip).limit(pageSize); 
        console.log("rrrrrr",productData); 
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
        const pageSize = 2;
        const skip = (page - 1) * pageSize;

        // Construct the filter object based on the selected filter parameters
        const filter = {};
        if (selectedBrands) {
            filter.BrandName = selectedBrands;
        }
        if (selectedCategory) {
            filter.Category = selectedCategory;
        }
        if (selectedPrice) {
            // Implement your price filter logic here
            // Example: Parse selectedPrice to filter products with a price greater than or equal to a certain value
            const priceValue = parseInt(selectedPrice);
            filter.Price = { $lte: priceValue };
        }

        // Query the database with the filter conditions
        const productData = await productsCollections.find(filter).skip(skip).limit(pageSize);
        const productDataCount = await productsCollections.countDocuments(filter); // Get the count based on the filter

        const totalProducts = Math.ceil(productDataCount / pageSize);
        console.log("productData====",productData);
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


module.exports={
    getProducDetails,
    getAllProducts,
    postFilterProduct
}
