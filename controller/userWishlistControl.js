const wishlistCollection = require('../model/wishlist')
const userCollection = require('../model/user')



//User Wishlist
async function getWhislist(req,res){
    try{
        let user = req.session.user
        let email = req.session.email
        const userData = await userCollection.findOne({email:email})
        // console.log("userData<<<<<<<",userData);
        const userId=userData._id
        // console.log("userId<<<<<<<",userId);
        const wishlist= await wishlistCollection.findOne({user:userId}).populate('products');
        // console.log("Wishlist>>>>>",wishlist);
        // console.log("Wishlist Length:", wishlist.length);
        // console.log("Wishlist Products:", wishlist.products);
        res.render('userView/userWishlist',{title:"Whislist",user,wishlist})
    }catch(error){
        // res.status(500).send('Internal server error')
        res.render("errorView/404");
    }
}

//post wishlist
async function postWishlist(req,res){
    try{
        const {productId}=req.body
        // console.log("productId>>>>>>>>",productId);
        const email = req.session.email
        const userData = await userCollection.findOne({email:email})
        // console.log("userData>>>>>>",userData);
        const userId =userData._id
        // console.log("userId>>>>",userId);
        const existingItem = await wishlistCollection.findOne({ products: productId, user: userId });
        // console.log("existingitem>>>>",existingItem);
        if (existingItem) {
            // console.log("11111111");
            const Remove = await wishlistCollection.findOneAndUpdate(
              { user: userId },
              { $pull: { products: productId } },
              { new: true }
          );
        //   console.log("22222222");
              res.json({ added: false });
            } else {
                // console.log("33333333333");
              let wishlist = await wishlistCollection.findOne({ user: userId });
            //   console.log("444444444",wishlist);
              if (!wishlist) {
                wishlist = new wishlistCollection({ user: userId, products: [] });
              }
            //   console.log("555555555");
              wishlist.products.push(productId);
              await wishlist.save();
              res.json({ added: true });
               }
            //    console.log("6666666666");


    }catch(error){
        res.render("errorView/404");
    }
}

//User Delete wishlist
async function postDeleteWishlist(req, res) {
    try {
        const { productId } = req.body;
        // console.log("Received request to remove product with ID:", productId);

        const userEmail = req.session.email;
        const user = await userCollection.findOne({ email: userEmail });

        if (!user) {
            console.error("User not found for email:", userEmail);
            return res.status(404).json({ error: "User not found" });
        }

        const userId = user._id;

        const result = await wishlistCollection.findOneAndUpdate(
            { user: userId },
            { $pull: { products: productId } },
            { new: true }
        );

        if (result) {
            console.log("Product removed from wishlist:", result);
            res.json({ success: true });
        } else {
            console.error("Product not found in the wishlist for user ID:", userId);
            res.status(404).json({ error: "Product not found in the wishlist" });
        }
    } catch (error) {
        console.error("Error removing product from wishlist:", error);
        res.render("errorView/404");
    }
}




module.exports={
    getWhislist,
    postWishlist,
    postDeleteWishlist
}