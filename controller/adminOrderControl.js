const orderCollection = require('../model/order')
const userCollection = require('../model/user')



//Order details page
async function getOrderDetails(req,res){
    try{
        var i = 0;
        const ordersData = await orderCollection.find().sort({OrderDate:-1});
        console.log("orders : ",ordersData);
        res.render('adminView/orderDetails',{title:"Order detailrsrss",ordersData,i})
    }catch(err){
    console.log(err);
    res.render('errorView/404admin')
    res.status(500).send('Internal Server Error');
  }
}

//Update order status
async function putUpdateStatus(req,res){
    try{
        const orderId = req.params.orderId;
        const newStatus = req.body.status;
        await orderCollection.findByIdAndUpdate(orderId,{Status:newStatus})
    }catch (error) {
        console.error('Error updating order status:', error);
        res.json({ success: false });
  }
}

//View order details
async function getViewOrder(req,res){
    try{
        const orderId = req.params.orderId;
        const orders = await orderCollection.findById(orderId).populate('Items.productId');
        if(!orders){
            return res.render('errorView/404admin')
        }else{
            res.render('adminView/orderDetailsView',{title:"Order Details", ProductAllDetails : orders.Items})
        }
    }catch(err){
    console.log(err);
    res.render('errorView/404admin')
    res.status(500).send('Internal Server Error');
  }
}

module.exports={
    getOrderDetails,
    putUpdateStatus,
    getViewOrder
}