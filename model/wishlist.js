const mongoose = require('mongoose');
const { Schema, ObjectId } = mongoose;

const wishlistSchema = new Schema({
    user: { type: Schema.Types.ObjectId, 
        ref: 'Users', required: true },
    products: [{ type: Schema.Types.ObjectId,
         ref: 'Products'
         }],
  });
  
  const Wishlist = mongoose.model('Wishlist', wishlistSchema);

  module.exports = Wishlist;