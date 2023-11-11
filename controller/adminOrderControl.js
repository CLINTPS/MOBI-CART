const orderCollection = require('../model/order')
const userCollection = require('../model/user')



//Order details page
async function getOrderDetails(req,res){
    try{
        var i = 0;
        const page = parseInt(req.query.page) || 1;
        const orderDataCount = await orderCollection.find().count()
        // console.log("uuuuu",orderDataCount);
        const pageSize = 4;
        const totalOrder = Math.ceil(orderDataCount / pageSize);
        // console.log("wwttttwww",totalOrder);  
        const skip = (page - 1) * pageSize;
        const ordersData = await orderCollection.find().skip(skip).limit(pageSize).sort({OrderDate:-1});

        // console.log("yyyyy",ordersData); 
        res.render('adminView/orderDetails',{title:"Order detailrsrss",
                i,
                ordersData,
                orderDataCount:totalOrder,
                page: page
            })
    }catch(err){
    console.log(err);
    res.render('errorView/404admin')
    // res.status(500).send('Internal Server Error');
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
    // res.status(500).send('Internal Server Error');
  }
}

module.exports={
    getOrderDetails,
    putUpdateStatus,
    getViewOrder
}