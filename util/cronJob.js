const product = require("../model/product");
const offer = require("../model/offer");
const Category=require('../model/categories')
const cron = require("node-cron");


const checkCategoryOffers = async () => {
  try {
    console.log("Check-offer....!!!");
    const currentDate = new Date();
    const offers = await offer.find({ expiryDate: { $lte: currentDate } });
    console.log("Check.offers...",offers);
   if (offers.length > 0) {
      for (const offer of offers) {

        const previousDiscounts = {};
        const productsToUpdate = await product.find({ Category : offer.categoryName });

        productsToUpdate.forEach(product => {
          previousDiscounts[product._id] = product.DiscountAmount;
        });

        // const discountAmounts = offer.offerPercentage;

        const discountAmount=productsToUpdate.beforeOffer

       const products = await product.updateMany(
          { Category: offer.categoryName },
          { $set: {
            DiscountAmount: discountAmount,
             IsInCategoryOffer: false,
             categoryOffer: { offerPercentage: undefined }
             } }
        );
        
        await offer.deleteOne({ _id: offer._id });
        
      }
    }
    
  } catch (error) {
    console.error("Error in the cron job:", error);
    throw error;
  }
};



// cron.schedule("*/100 * * * * *", async () => {
//     try {
//       await checkCategoryOffers();
//     } catch (error) {
//       console.error("Error in cron job:", error);
//     }
//   });
  