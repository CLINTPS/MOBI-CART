const productModel = require("../model/product");
const offer = require("../model/offer");
const Category=require('../model/categories')
const cron = require("node-cron");


const checkCategoryOffers = async () => {
  try {
    console.log("Check-offer....!!!");
    const currentDate = new Date();
    const offers = await offer.find({ expiryDate: { $lte: currentDate } });
    if (offers.length > 0) {
      for (const offer of offers) {
        const previousDiscounts = {};
        const filter = { Category: offer.categoryName };

        const productsToUpdate = await productModel.find(filter);

        productsToUpdate.forEach(async (product) => {
          previousDiscounts[product._id] = product.DiscountAmount;
          const discountAmount = product.beforeOffer;

          await productModel.updateMany(
            filter,
            {
              $set: {
                DiscountAmount: discountAmount,
                IsInCategoryOffer: false,
                categoryOffer: { offerPercentage: undefined },
              },
            }
          );
        });

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
  