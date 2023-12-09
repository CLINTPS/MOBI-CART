const couponCollection = require('../model/coupon')

//Get coupon page
async function getCouponView(req,res,next){
    try{
        const couponData = await couponCollection.find().sort()
        // console.log("couponData",couponData);
        res.render('adminView/coupon',{title:"coupons",couponData})
    } catch (error) {
    console.error(error);
    next(error);
  }
}

//post new coupon
const postCreateCoupon= async (req,res)=>{
    try {
        const { name, couponCode, description, maxAmount, discountAmount, couponType, startDate, endDate} = req.body;
        // console.log("+++++",name,couponCode,description,maxAmount,discountAmount,couponType,startDate,endDate);

        const existingCoupon = await couponCollection.findOne({ CoupenCode: couponCode });
        if (existingCoupon) {
          return res.status(400).json({ success: false, message: 'Coupon with this code already exists.' });
        }
        
        if (!name || !couponCode || !description || isNaN(maxAmount) || isNaN(discountAmount) || !couponType || !startDate || !endDate ) {
            return res.status(400).json({ success: false, message: 'Invalid input. Please provide all required fields with valid values.' });
          }
      
        const coupon = new couponCollection({
            CoupenName:name,
            CoupenCode:couponCode,
            description,
            MinAmount:maxAmount,
            DiscountAmount:discountAmount,
            couponType:couponType,
            StartDate:startDate,
            EndDate:endDate,
          
          });
      console.log("coupen saving..");
          await coupon.save();
          console.log("coupon saved..")
          res.json({ success: true, message: 'Coupon created successfully' });

    } catch (error) {
        console.error("error happened in coupon ",error)
        res.status(500).json({ success: false, message: 'Internal server error' });
        res.render('errorView/404admin')

    }
}

//Delete coupon
async function getDeleteCoupon(req,res,next){
    try{
        let couponID= req.params.id 
        // console.log("couponID:",couponID);
        await couponCollection.deleteOne({_id:couponID})
        res.redirect('/admin/Coupons')
    }catch (error) {
    console.error(error);
    next(error);
  }
}

//Edit coupon
async function getEditCoupon(req,res,next){
  try{
    let couponId=req.params.id
    console.log("couponId..",couponId);
    const couponData = await couponCollection.findOne({_id:couponId})
    console.log("couponData..",couponData);
    res.render('adminView/editCoupon',{title:"Edit coupon",couponData})
  }catch (error) {
    console.error(error);
    next(error);
  }
}

//Post Edit Coupon
async function postEditCoupon(req,res,next){
  try{
    // console.log("postData..",req.body);
    const couponId = req.body.couponId;
    const { name, couponCode, description, maxAmount, discountAmount, couponType, startDate, endDate} = req.body;
    const couponData=await couponCollection.updateOne(
      { _id: couponId },
      { $set: {
        CoupenName:name,
        CoupenCode:couponCode,
        description,
        MinAmount:maxAmount,
        DiscountAmount:discountAmount,
        couponType:couponType,
        StartDate:startDate,
        EndDate:endDate,
       }
      }
    );
    // console.log("couponData...",couponData);
    res.json({ success: true, message: 'Coupon updated successfully' });
  }catch (error) {
    console.error(error);
    next(error);
  }
}

module.exports={
    getCouponView,
    postCreateCoupon,
    getDeleteCoupon,
    getEditCoupon,
    postEditCoupon
}