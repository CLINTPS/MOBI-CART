const wishlistCollection = require('../model/wishlist')
const userCollection = require('../model/user')



//User Wishlist
async function getWhislist(req,res){
    try{
        let user = req.session.user
        res.render('userView/userWishlist',{title:"Whislist",user})
    }catch(error){
        // res.status(500).send('Internal server error')
        res.render("errorView/404");
    }
}

//post wishlist
async function postWishlist(req,res){
    try{
        const {productId}=req.body
        console.log("productId>>>>>>>>",productId);
        const email = req.session.email
        const userData = await userCollection.findOne({email:email})
        console.log("userData>>>>>>",userData);
        const userId =userData._id
        console.log("userId>>>>",userId);
        const existingItem = await wishlistCollection.findOne({ products: productId, user: userId });
        console.log("existingitem>>>>",existingItem);
        if (existingItem) {
            console.log("11111111");
            const Remove = await wishlistCollection.findOneAndUpdate(
              { user: userId },
              { $pull: { products: productId } },
              { new: true }
          );
          console.log("22222222");
              res.json({ added: false });
            } else {
                console.log("33333333333");
              let wishlist = await wishlistCollection.findOne({ user: userId });
              console.log("444444444",wishlist);
              if (!wishlist) {
                wishlist = new wishlistCollection({ user: userId, products: [] });
              }
              console.log("555555555");
              wishlist.products.push(productId);
              await wishlist.save();
              res.json({ added: true });
               }
               console.log("6666666666");


    }catch(error){
        res.render("errorView/404");
    }
}


module.exports={
    getWhislist,
    postWishlist
}