const express = require('express')
const session = require('express-session')
const path = require('path')
const mongoose = require('mongoose')
const OTProutes=require("./util/otpindex")
const { v4: uuidv4 } = require("uuid")
const app=express()
const adminRouter=require("./router/adminRoutes")
const userRouter=require("./router/userRoutes")
const passport=require('passport')
require('dotenv').config()
const flash=require("connect-flash")
const nocache = require("nocache");
// const morgan=require("morgan")
const errorMiddleware = require('./middleware/errorMiddleware');
const cronjob=require('./util/cronJob')


//Set Template Engin
app.set('view engine',"ejs")
app.set('views',path.join(__dirname,'views'))

// app.use(morgan('tiny'))
app.use(nocache())
app.use(express.static('public'))
app.use(express.urlencoded({extended:true}))
app.use(express.json())



app.use(session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: false
}));

app.use(flash())
app.use("/", userRouter);
app.use("/otp",OTProutes)
app.use("/admin", adminRouter);

app.use((err, req, res, next) => {
    errorMiddleware(err, req, res, next);
  });

//port setting
const PORT = process.env.PORT||5000
app.listen(PORT,()=>{
    console.log(`Start running http://localhost:${PORT}`);
})
