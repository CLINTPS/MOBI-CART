const mongoose = require('mongoose')

require('dotenv').config()

mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log("DB Started")
}).catch(() => {
    console.log("Not Connect")
})

const userSchema=mongoose.Schema({
    name:{
        type:String,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    }
})

let userCollection= mongoose.model('signup', userSchema)

//inserting users data in database

module.exports=userCollection