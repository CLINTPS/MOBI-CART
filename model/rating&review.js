const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
    productId:{
        type: mongoose.Types.ObjectId,
        required:true,
        ref:"Products"
    },
    userId:{
        type:mongoose.Types.ObjectId,
        required:true,
        ref: "Users"
    },
    userName:{
        type: String,
        required: true,
    },
    rating:{
        type:Number,
        required:true,
        min:1,
        max:5
    },
    reviewText: {
        type: String,
        required: true,
    },
    reviewDate:{ 
        type:Date 
    }
});

const Review = mongoose.model('review',reviewSchema)
module.exports = Review