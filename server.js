const express = require('express')
const path = require('path')
const session = require('express-session')
const mongoose = require('mongoose')
const { v4: uuidv4 } = require("uuid")
const app=express()


require('dotenv').config()

const PORT = process.env.PORT||5000

app.use(express.static('public'))
app.use(express.urlencoded({extended:true}))
app.use(express.json())
const adminRouter=require("./router/adminRoutes")
const userRouter=require("./router/userRoutes")

//Set Template Engin
app.set('view engine',"ejs")
app.set('views',path.join(__dirname,'views'))

app.use(session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: false
}))

app.use("/", userRouter);
app.use("/admin", adminRouter);

//port setting
app.listen(PORT,()=>{
    console.log(`Start running http://localhost:${PORT}`);
})
