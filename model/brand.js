const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const BrandSchema = new Schema({
  name: { type: String, require:true},
  timeStamp:{ type:Date }
});

const Brands = mongoose.model('Brands', BrandSchema);

module.exports=Brands;
