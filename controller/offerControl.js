const offerCollection = require('../model/offer')
const categoriesCollection=require('../model/categories')
const productsCollections = require ('../model/product')


//Get offer page
async function getOfferPage(req,res,next){
    try{
        const categoryData = await categoriesCollection.find({})
        // console.log("categoryData.......",categoryData);
        const offerData = await offerCollection.find()
        res.render('adminView/offer',{title:"Offer Page",categoryData,offerData})
    }catch (error) {
    console.error(error);
    next(error);
  }
}

//Add  new offers

const postaddCategoryOffer = async (req, res,next) => {
        try {
            // console.log("............",req.body);
            const { categoryName, offerPercentage,startDate, expiryDate } = req.body;

            const fetchCategoryId = await categoriesCollection.findOne({ name: categoryName });
            // console.log("fetchCategoryId....",fetchCategoryId);
            if (!fetchCategoryId) {
                console.log('Category not found');
                return res.status(404).json({ error: 'Category not found' });
            }

            const categoryData= await offerCollection.findOne({categoryName:categoryName})
            // console.log("categoryData....",categoryData);
            
            if(categoryData){
                console.log('An offer already exists for this category');
                return res.status(400).json({ error: 'An offer already exists for this category' });
            }

            const newOffer = new offerCollection({
                categoryName,
                offerPercentage,
                startDate,
                expiryDate,
                status: 'Active', 
            });
            await newOffer.save();
            
            
            
            const categoryId = fetchCategoryId._id;
        //    console.log("categoryId....",categoryId);
    
            const productsBeforeOffer = await productsCollections.find({ Category :categoryName });
            // console.log("productsBeforeOffer........",productsBeforeOffer);
            for (const product of productsBeforeOffer) {
                const discountPrice = product.DiscountAmount;
                // console.log("discountPrice.......",discountPrice);
                await productsCollections.updateOne(
                    { _id: product._id },
                    { $set: { 
                        beforeOffer: discountPrice,
                        IsInCategoryOffer: true,
                        categoryOffer: { offerPercentage: offerPercentage }
                     } }
                );
            }
    
            const offerMultiplier = 1 - offerPercentage / 100;
            // console.log("offerMultiplier..........",offerMultiplier);
          
            const productData = await productsCollections.updateMany(
                { Category :categoryName  },
                {
                    $mul: { DiscountAmount: offerMultiplier },
                }
            );
            // console.log("productData........",productData);
    
            res.status(201).json({ success: true, message: 'Category offer added successfully' });
    
        } catch (error) {
            console.error(error);
            next(error);
          }
    };
    
//Delete offer
async function deleteOffer(req,res,next){
    try{
        const offerId = req.params.offerId;
        // console.log("offerId.......",offerId);
        const deletedOffer = await offerCollection.findById(offerId);
        if (!deletedOffer) {
            return res.status(404).json({ error: 'Offer not found' });
        }

        const { categoryName } = deletedOffer;

        const fetchCategoryId = await categoriesCollection.findOne({ name: categoryName });
        if (!fetchCategoryId) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const categoryId = fetchCategoryId._id;

        const productsBeforeOffer = await productsCollections.find({ Category :categoryName  });

         for (const product of productsBeforeOffer) {
            const oldPrice = product.beforeOffer || 0; 
            await productsCollections.updateOne(
                { _id: product._id },
                { $set: { 
                    DiscountAmount: oldPrice,
                    IsInCategoryOffer: false,
                    categoryOffer: { offerPercentage: undefined }
                 } }
            );
        }

        await offerCollection   .findByIdAndDelete(offerId);
        res.json({ success: true, message: 'Offer deleted successfully' });
    }catch (error) {
        console.error(error);
        next(error);
      }
}

//Edit offer
async function editOffer(req,res,next){
    try{
        const offerId = req.params.id;
        // console.log("offerIddddddd.......",offerId);
        const offerData = await offerCollection.findOne({_id:offerId})
        // console.log("offerData........",offerData);
        const categoryData=await categoriesCollection.find({})
        res.render('adminView/editOffer',{title:"Edit offer",offerData,categoryData})
    }catch (error) {
        console.error(error);
        next(error);
      }

}

//Post edit data
async function postEditOffer(req, res, next) {
    try {
        // console.log("1111111111111111", req.body);
        const { categoryName, offerPercentage, startDate, expiryDate } = req.body

        const existingOffer = await offerCollection.findOne({ categoryName: categoryName });

        if (!existingOffer) {
            return res.status(404).json({ error: 'Offer not found' });
        }

        existingOffer.offerPercentage = offerPercentage;
        existingOffer.startDate = startDate
        existingOffer.expiryDate = expiryDate;
        await existingOffer.save();

        const fetchCategoryId = await categoriesCollection.findOne({ name: categoryName })
        if (!fetchCategoryId) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const productDatas = await productsCollections.find({ Category: categoryName })
        // console.log("productDatas>>>>>>>>", productDatas);

        for (const product of productDatas) {
            const discountPrice = product.beforeOffer
            const offerMultiplier = 1 - offerPercentage / 100;
            const newDiscountedPrice = Math.floor(offerMultiplier * discountPrice);

            await productsCollections.updateOne(
                { _id: product._id },
                {
                    $set: {
                        DiscountAmount: newDiscountedPrice,
                        IsInCategoryOffer: true,
                        categoryOffer: offerPercentage,
                        categoryOffer: { offerPercentage: offerPercentage }
                    }
                }
            );
        }

        res.status(200).json({ message: 'Category offer updated successfully' });

    } catch (error) {
        console.error(error);
        next(error);
    }
}


module.exports={
    getOfferPage,
    postaddCategoryOffer,
    deleteOffer,
    editOffer,
    postEditOffer
}