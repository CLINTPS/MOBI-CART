const mongoose = require("mongoose");

const { Schema } = mongoose;

const OfferSchema = new Schema({
    categoryName: {type:String},
    offerPercentage:{type:Number},
    startDate:{type:Date},
    expiryDate: {type:Date},
    status: {type: String, default: "Active"},
})

const offer = mongoose.model('offer',OfferSchema)
module.exports = offer;