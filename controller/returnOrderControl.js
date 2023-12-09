const orderCollection = require('../model/order')
const userCollection = require('../model/user')


//Get order status page
async function getReturnOrder(req,res){
  try{
    var i = 0;
    const page = parseInt(req.query.page) || 1;
    const orderDataCount = await orderCollection.find().count()
    // console.log("mmmmmmmm",orderDataCount);
    const pageSize = 4;
    const totalOrder = Math.ceil(orderDataCount / pageSize);
    // console.log("cccccccc",totalOrder);  
    const skip = (page - 1) * pageSize;
    const ordersData = await orderCollection.find().sort({OrderDate:-1});

    // console.log("aaaaaaaaa",ordersData); 
    res.render('adminView/returnOrder',{title: "Return Orders",ordersData})
  }catch(err){
    console.log(err);
    res.render('errorView/404admin')
  }
}

//accept return request
const putAcceptReturn=async(req,res)=>{
    try {
      const orderId = req.params.orderId; 
      console.log("orderId>>>>>>>>>>>>>",orderId);
      const updatedOrder = await orderCollection.findByIdAndUpdate(
        orderId,
        { $set: { Status: 'Return Accepted' } },
        { new: true }
      );
      console.log("updatedOrder>>>>>>>>>>>>>>>>>>>",updatedOrder);
      const userId = updatedOrder.UserId;
      const refundAmount = updatedOrder.TotalPrice;
  
      await userCollection.findByIdAndUpdate(userId, { $inc: { 'wallet.amount': refundAmount },
        $push:{
          'wallet.transactions':{
            amount:refundAmount,
            transactionType:'credit',
            timestamp: new Date(),
            description:"Return order refund amount"
          }
        }
    },{new : true});
  
      res.json({ success: true, order: updatedOrder });
  
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }
  
  
  //cancel return
  const putCancelReturn=async(req,res)=>{
    try {
      const orderId = req.params.orderId;
      // console.log("orderId;;;");
      const updatedOrder = await orderCollection.findByIdAndUpdate(
        orderId,
        { $set: { Status: 'Return Canceled' } },
        { new: true }
      );
      // console.log("updatedOrder;;;;;",updatedOrder);
      res.json({ success: true, order: updatedOrder });
  
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }


module.exports={
    getReturnOrder,
    putAcceptReturn,
    putCancelReturn
}