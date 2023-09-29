const express = require('express')
const path = require('path')
const session = require('express-session')
const mongoose = require('mongoose')
const app=express()


require('dotenv').config()

const PORT = process.env.PORT||5000

app.use(express.static('public'))
app.use(express.urlencoded({extended:true}))
app.use(express.json())

//Set Template Engin
app.set('view engine',"ejs")
app.set('views',path.join(__dirname,'views'))

app.use(session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: false
}))

//admin route
app.use("/",require("./router/adminRoutes"))
//user route
app.use("/",require("./router/userRoutes"))

//port setting
app.listen(PORT,()=>{
    console.log(`Start running http://localhost:${PORT}`);
})
