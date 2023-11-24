const orderCollection = require('../model/order')


async function getReturnOrder(req,res){
    res.render('adminView/returnOrder',{title: "Return Orders"})
}

module.exports={
    getReturnOrder
}