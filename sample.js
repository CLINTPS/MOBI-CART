const useCoupon= async (req,res)=>{
    try {
      console.log("coupon added");
      const {couponCode} = req.body; 
      console.log(couponCode);
      const userData=await Users.findOne({email:req.session.email})
  
    const cartData=await cart.findOne({userId:userData._id})
    console.log(".................",cartData);
      const purchaseAmount=req.session.totalPrice
      console.log(purchaseAmount);
      const coupon = await Coupons.findOne({ CoupenCode: couponCode });
      console.log(",,,,,,",coupon)
      if (!coupon) {
        return res.json({ success: false, message: 'Coupon not found' });
      }
  
      const isCouponUsed = userData.usedCoupons.some(usedCoupon => usedCoupon.couponCode === couponCode);
      console.log(isCouponUsed);
      if (isCouponUsed) {
        return res.json({ success: false, message: 'Coupon already used' });
      }
      
      if (purchaseAmount < coupon.MinAmount) {
        return res.json({ success: false, message: 'Purchase amount does not meet the minimum requirement for the coupon' });
      }
      console.log("--------",purchaseAmount,coupon.MinAmount);
  
      const currentDate = new Date();
      const endDate = new Date(coupon.EndDate);
      if (currentDate > endDate) {
        return res.json({ success: false, message: 'Coupon has expired' });
      }
  console.log(currentDate,endDate);
    
      const discountedAmount = Math.min(purchaseAmount, coupon.DiscountAmount);
      const totalAfterDiscount = purchaseAmount - discountedAmount;
      req.session.grandTotal=totalAfterDiscount
      console.log(totalAfterDiscount,"***********");
      userData.usedCoupons.push({
        couponCode: couponCode,
        discountedAmount: discountedAmount,
        usedDate: new Date(),
      });
      await userData.save();
  console.log(userData,"/////////");
    
  return res.json({
    success: true,
    message: 'Coupon applied successfully',
    coupon:discountedAmount,
    discountedAmount: discountedAmount,
    grandTotal:totalAfterDiscount
  });
  
  } catch (error) {
      console.error(error,"error happpened in coupon management")
    }
  }
  