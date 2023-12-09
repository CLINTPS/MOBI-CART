const reviewCollection = require('../model/rating&review')
const userCollection = require('../model/user')
const productsCollections = require ('../model/product')
const mongoose = require('mongoose')


async function postUserReviewAndRating(req,res){
    try{
        // console.log("postUserReviewAndRating",req.body);
        const{ rating, review, producId}=req.body
        let userEmail = req.session.email
        const userData = await userCollection.findOne({email:userEmail})
        const userId=userData._id
        const userName=userData.userName

        const existingReview = await reviewCollection.findOne({
            productId: producId,
            userId: userId,
        });
        console.log("111111111111",existingReview);
        if (existingReview) {
            await reviewCollection.findByIdAndUpdate(existingReview._id, {
                rating: rating,
                reviewText: review,
                reviewDate: new Date(),
            });

            res.status(200).json({ success: true, message: 'Review updated successfully.' });
        }else{
            const reviewData = new reviewCollection({
                productId: producId,
                userId: userId,
                userName:userName,
                rating: rating,
                reviewText: review, 
                reviewDate: new Date(),
            });
            await reviewData.save();
            res.status(200).json({ success: true, message: 'Review added successfully.' });
        }


    }catch (error) {
        console.error("An error occurred:", error);
        res.render("errorView/404");
    }
   
}




//Add and edit review page
async function getReviewpage(req,res){
    try{
        let orderID=req.query.orderId
        let productId = req.query.productId;
        // console.log("edit producId",productId);
        // console.log("edit orderID",orderID);
        if (!mongoose.Types.ObjectId.isValid(orderID)|| !mongoose.Types.ObjectId.isValid(productId)) {
            res.render("errorView/404");
            return;
        }
        // console.log(orderID);
        let user=req.session.user
        const orders=await productsCollections.findOne({_id:productId})
        const email=req.session.email
        // console.log("email.....",email);
        const userData =await userCollection.findOne({email:email})
        // console.log("userData....",userData);
        const userId=userData._id
        // console.log("userId....",userId);
        const reviewData = await reviewCollection.find({userId:userId,productId:productId})
        // console.log("reviewData...",reviewData);

        res.render('userView/userOrderReview',{title:"Order Review",user,orders,reviewData})
    }catch (error) {
        console.error("An error occurred:", error);
        console.log("cart data note available 02--");
        res.render("errorView/404");
    }
}

//Add and edit review post methode
async function ReviewAndRatingAddAndEdit(req,res){
    // let body=req.body
    // console.log("bodyyyyyyyyyyy",body);
    const{ rating, review, producId}=req.body
        let userEmail = req.session.email
        const userData = await userCollection.findOne({email:userEmail})
        const userId=userData._id
        const userName=userData.userName

        const existingReview = await reviewCollection.findOne({
            productId: producId,
            userId: userId,
        });
        // console.log("111111111111",existingReview);
        if (existingReview) {
            await reviewCollection.findByIdAndUpdate(existingReview._id, {
                rating: rating,
                reviewText: review,
                reviewDate: new Date(),
            });

            res.status(200).json({ success: true, message: 'Review updated successfully.' });
        }else{
            const reviewData = new reviewCollection({
                productId: producId,
                userId: userId,
                userName:userName,
                rating: rating,
                reviewText: review, 
                reviewDate: new Date(),
            });
            await reviewData.save();
            res.status(200).json({ success: true, message: 'Review added successfully.' });
        }
}

module.exports={
    postUserReviewAndRating,
    getReviewpage,
    ReviewAndRatingAddAndEdit
}