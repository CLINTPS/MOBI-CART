const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const CategoriesSchema = new Schema({
  name: { type: String, require:true},
  timeStamp:{ type:Date }
});

const Categories = mongoose.model('Categories', CategoriesSchema);

module.exports=Categories;
