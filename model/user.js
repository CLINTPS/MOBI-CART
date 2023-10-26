const mongoose = require('mongoose');
const connection=require("../config/connection")

const { Schema, ObjectId } = mongoose;

const UsersSchema = new Schema({
  userName: { type: String, required: true,  },
  password: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  status: { type: Boolean,
            default:true},
  address: [{
     addressLine: { type: String },
     city: { type: String },
     pincode: { type: Number },
     state: { type: String },
     mobile:{type: Number}
  }],
  orders: [{
     orderId: { type: Schema.Types.ObjectId },
  }],
  dob: { type: Date },
  gender: { type: String },
},{timestamps:true});

const Users = mongoose.model('Users', UsersSchema);

module.exports=Users;