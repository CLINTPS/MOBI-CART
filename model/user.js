const mongoose = require('mongoose');
const connection=require("../config/connection")

const { Schema, ObjectId } = mongoose;

const TransactionSchema = new Schema({
   amount: { type: Number },
   transactionType: { type: String, enum: ['debit', 'credit'] },
   timestamp: { type: Date, default: Date.now },
   description: { type: String },
 });

const UsersSchema = new Schema({
  userName: { type: String, required: true,  },
  password: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  status: { type: Boolean,
            default:true},
  profilePhoto:{type:String},
  wallet: {
   amount: { type: Number, default: 0 },
   transactions: [TransactionSchema],
  },
  usedCoupons:[{ 
      couponCode: { type: String },
      discountedAmount: { type: Number },
      usedDate: { type: Date } 
   }],
  address: [{
     nameuser: { type:String},
     addressLine: { type: String },
     city: { type: String },
     pincode: { type: Number },
     state: { type: String },
     mobile:{type: Number}
  }],
  orders: [{
     orderId: { type: Schema.Types.ObjectId },
  }],

},{timestamps:true});

const Users = mongoose.model('Users', UsersSchema);

module.exports=Users;