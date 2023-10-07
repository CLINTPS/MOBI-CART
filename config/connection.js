const mongoose = require('mongoose')

require('dotenv').config()

module.exports=
mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log("DB Started")
}).catch(() => {
    console.log("Not Connect")
})