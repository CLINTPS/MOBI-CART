const userCollection=require('../model/user')
const orderCollection = require('../model/order')
const moment = require('moment')
const {format}= require('date-fns')
const pdf = require('../util/salesReport')



//Admin password and user id
const credential = {
    email: "clint@gmail.com",
    password: "12345678"
}

//admin page
function getAdminpage(req, res) {
        res.render('adminView/adminLog',{title:"admin-login"})
}

//Admin login to admin view page

function postAdminpage(req, res){
    try{
        if (req.body.email == credential.email && req.body.password == credential.password) {
            req.session.admin = req.body.email;
            req.session.adminLogin = true
            console.log("logined");
            res.render("adminView/dashboard",{title:"Admin Dashboard"})
        } else {
            res.render('adminView/adminLog', { title: "admin page", err: "Invalid Username or Password" })
        }
    }catch(error){
        console.log("Error 1:"+error);
    }
}
// TO dashboard
function getDashboard (req,res){
    try{
        res.render('adminView/dashboard',{title:"admin-Dashboard"})
    }catch(error){

        res.render("errorView/404admin");
    }
}

//Latest orders
async function getlatestOrders(req,res){
    try{
        const latestOrders = await orderCollection.find().sort({ _id: -1 }).limit(6);
        // console.log("latestOrders...........",latestOrders);

        const bestSeller = await orderCollection.aggregate([
          {
            $unwind: "$Items",
          },
          {
            $group: {
              _id: "$Items.productId",
              totalCount: { $sum: "$Items.quantity" },
            },
          },
          {
            $sort: {
              totalCount: -1,
            },
          },
          {
            $limit: 4,
          },
          {
            $lookup: {
              from: "products",
              localField: "_id",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          {
            $unwind: "$productDetails",
          },
        ]);
        // console.log("bestSeller...........",bestSeller);
        if (!latestOrders || !bestSeller) throw new Error("No Data Found");
      
        res.json({ latestOrders, bestSeller });
    }catch(error){
        res.render("errorView/404admin");
    }
}

//Order sales report
async function getSalesGraph(req,res){
    // console.log("getSalesGraph function start");
    try {
        const orders = await orderCollection.find({
          Status: {
            $nin:["returned","Cancelled","Rejected"]
          }
        });
        // console.log("001",orders);
        const orderCountsByDay = {};
        const totalAmountByDay = {};
        const orderCountsByMonthYear = {};
        const totalAmountByMonthYear = {};
        const orderCountsByYear = {};
        const totalAmountByYear = {};
        let labelsByCount;  
        let labelsByAmount;
       
        orders.forEach((order) => {
    
          const orderDate = moment(order.OrderDate, "M/D/YYYY, h:mm:ss A");
          // console.log("002",orderDate);
          const dayMonthYear = orderDate.format("YYYY-MM-DD");
          // console.log("003",dayMonthYear);
          const monthYear = orderDate.format("YYYY-MM");
          // console.log("004",monthYear);
          const year = orderDate.format("YYYY");
          // console.log("005",year);
          // console.log("total amonunt--------",order.TotalPrice);
          if (req.url === "/Orders-By-day") {
           
            if (!orderCountsByDay[dayMonthYear]) {
              orderCountsByDay[dayMonthYear] = 1;
              totalAmountByDay[dayMonthYear] = order.TotalPrice
             
             
            } else {
              orderCountsByDay[dayMonthYear]++;
              totalAmountByDay[dayMonthYear] += order.TotalPrice
            }
    
            const ordersByDay = Object.keys(orderCountsByDay).map(
              (dayMonthYear) => ({
                _id: dayMonthYear,
                count: orderCountsByDay[dayMonthYear],
              })
            );
              // console.log("005",ordersByDay);
    
            const amountsByDay = Object.keys(totalAmountByDay).map(
              (dayMonthYear) => ({
                _id: dayMonthYear,
                total: totalAmountByDay[dayMonthYear],
              })
            );
    
            // console.log("006",amountsByDay);
    
            amountsByDay.sort((a,b)=> (a._id < b._id ? -1 : 1));
            ordersByDay.sort((a, b) => (a._id < b._id ? -1 : 1));
    
           
    
            labelsByCount = ordersByDay.map((entry) =>
              moment(entry._id, "YYYY-MM-DD").format("DD MMM YYYY")
            );
              // console.log('007',labelsByCount);

            labelsByAmount = amountsByDay.map((entry) =>
              moment(entry._id, "YYYY-MM-DD").format("DD MMM YYYY")
            );
              // console.log('008',labelsByAmount);

            dataByCount = ordersByDay.map((entry) => entry.count);
            dataByAmount = amountsByDay.map((entry) => entry.total);
              // console.log("009",dataByCount);
              // console.log("010",dataByAmount);
           
    
          } else if (req.url === "/Orders-By-month") {
            if (!orderCountsByMonthYear[monthYear]) {
              orderCountsByMonthYear[monthYear] = 1;
              totalAmountByMonthYear[monthYear] = order.TotalPrice;
            } else {
              orderCountsByMonthYear[monthYear]++;
              totalAmountByMonthYear[monthYear] += order.TotalPrice;
            }
          
            const ordersByMonth = Object.keys(orderCountsByMonthYear).map(
              (monthYear) => ({
                _id: monthYear,
                count: orderCountsByMonthYear[monthYear],
              })
            );
            const amountsByMonth = Object.keys(totalAmountByMonthYear).map(
              (monthYear) => ({
                _id: monthYear,
                total: totalAmountByMonthYear[monthYear],
              })
            );
            // console.log("011",ordersByMonth);
            // console.log("012",amountsByMonth);
          
            ordersByMonth.sort((a, b) => (a._id < b._id ? -1 : 1));
            amountsByMonth.sort((a, b) => (a._id < b._id ? -1 : 1));
           
          
            labelsByCount = ordersByMonth.map((entry) =>
              moment(entry._id, "YYYY-MM").format("MMM YYYY")
            );
            labelsByAmount = amountsByMonth.map((entry) =>
              moment(entry._id, "YYYY-MM").format("MMM YYYY")
            );
            // console.log("013",labelsByCount);
            // console.log("014",labelsByAmount);
            dataByCount = ordersByMonth.map((entry) => entry.count);
            dataByAmount = amountsByMonth.map((entry) => entry.total);
            // console.log("015",dataByCount);
              // console.log("016",dataByAmount);
          } else if (req.url === "/Orders-By-year") {
            // Count orders by year
            if (!orderCountsByYear[year]) {
              orderCountsByYear[year] = 1;
              totalAmountByYear[year] = order.TotalPrice;
            } else {
              orderCountsByYear[year]++;
              totalAmountByYear[year] += order.TotalPrice;
            }
          
            const ordersByYear = Object.keys(orderCountsByYear).map((year) => ({
              _id: year,
              count: orderCountsByYear[year],
            }));
            const amountsByYear = Object.keys(totalAmountByYear).map((year) => ({
              _id: year,
              total: totalAmountByYear[year],
            }));
          
            ordersByYear.sort((a, b) => (a._id < b._id ? -1 : 1));
            amountsByYear.sort((a, b) => (a._id < b._id ? -1 : 1));
          
            labelsByCount = ordersByYear.map((entry) => entry._id);
            labelsByAmount = amountsByYear.map((entry) => entry._id);
            dataByCount = ordersByYear.map((entry) => entry.count);
            dataByAmount = amountsByYear.map((entry) => entry.total);
          }
        });
    
        
        res.json({ labelsByCount,labelsByAmount, dataByCount, dataByAmount });
        

    }catch(error){
        console.log("Error.......:",error);
        res.render("errorView/404admin");
    }
}

//Sales report
const postSalesReport = async(req,res)=>{
    try{
        console.log(req.body);
        const startDate = moment(req.body.startDate, 'YYYY-MM-DD').format('MM/DD/YYYY, h:mm:ss A');
        console.log("startDate...", startDate);
        const format = req.body.downloadFormat;
        console.log("format...", format);
        const endDate = moment(req.body.endDate, 'YYYY-MM-DD').endOf('day').format('MM/DD/YYYY, h:mm:ss A');
        console.log("endDate...", endDate);
        const orders = await orderCollection.find({
          PaymentStatus: { $in: ["Paid", "Pending"] },
            OrderDate:{$gte:startDate,$lte:endDate}
        }).populate("Items.productId");
        console.log("orders........",orders);
        let totalSales = 0;
        orders.forEach((order) => {
            totalSales += order.TotalPrice || 0;
          });
          console.log("Total sales.......",totalSales);
          pdf.downloadReport(
            req,
            res,
            orders,
            startDate,
            endDate,
            totalSales.toFixed(2),
            format
          );
          
    }catch(error){
        console.log("Error.......:",error);
        res.render("errorView/404admin");
    }
}

//To coustomer details
async function userdetails(req, res) {
    try {
        var i = 0;
        const page = parseInt(req.query.page) || 1;
        const userDataCount = await userCollection.find().count()
        const pageSize = 4;
        const totalOrder = Math.ceil(userDataCount / pageSize);
        const skip = (page - 1) * pageSize;
        const useData = await userCollection.find().skip(skip).limit(pageSize).sort({createdAt:-1});

        const successMessage = req.query.successMessage || '';
        const errorMessage = req.query.errorMessage || '';

        res.render('adminView/customers', { title: "customer details",
            i,
            useData,
            userDataCount:totalOrder,
            page: page,
            successMessage,
            errorMessage
         });
    } catch (error) {
        res.render("errorView/404admin");
    }
}


//User serch
async function userSerch(req,res){
    try{
        var i = 0;
        const data = req.body.search; 
        console.log(data);
        const page = parseInt(req.query.page) || 1;

        const userDataCount = await userCollection.find().count()
        const pageSize = 4;
        const totalOrder = Math.ceil(userDataCount / pageSize);
        const skip = (page - 1) * pageSize;

        let useData = await userCollection.find({
            userName: { $regex: "^" + data, $options: "i" },
    }).skip(skip).limit(pageSize).sort({createdAt:-1});
   
    if(useData.length===0){
        var i = 0;
        const page = parseInt(req.query.page) || 1;
        const userDataCount = await userCollection.find().count()
        const pageSize = 4;
        const totalOrder = Math.ceil(userDataCount / pageSize);
        const skip = (page - 1) * pageSize;
        const useData = await userCollection.find().skip(skip).limit(pageSize).sort({createdAt:-1});

        const successMessage = req.query.successMessage || '';
        const errorMessage = req.query.errorMessage || '';

        res.render('adminView/customers', { title: "customer details",
            i,
            useData,
            userDataCount:totalOrder,
            page: page,
            successMessage,
            errorMessage
         });
    }else{
        console.log(`Search Data ${useData} `);
        const successMessage = req.query.successMessage || '';
        const errorMessage = req.query.errorMessage || '';
        res.render('adminView/customers', { title: "customer details",
        useData,
        userDataCount:totalOrder,
        i,
        page: page,
        successMessage, 
        errorMessage
     });
    }
    }catch(error){

        res.render("errorView/404admin");
    }
}

//user block unblock
const UserStatus = async (req, res) => {
    const id = req.params.id;
    console.log("Receive request " + id);

    // Find the user by ID
    const user = await userCollection.findOne({ _id: id });

    if (!user) {
        return res.status(404).send("User not found");
    }

    const newStatus = !user.status;
    const result = await userCollection.updateOne(
        { _id: id },
        { $set: { status: newStatus } }
    );

    if (result.modifiedCount === 1) {
        req.session.logged = false;
        console.log(`User ${user.userName} is ${newStatus ? "unblocked" : "blocked"}`);
        const successMessage = `User ${user.userName} is ${newStatus ? "unblocked" : "blocked"} successfully`;
        return res.redirect("/admin/userDetails?successMessage=" + encodeURIComponent(successMessage));
    } else {
        const errorMessage = "User blocking/unblocking failed";
        return res.redirect("/admin/userDetails?errorMessage=" + encodeURIComponent(errorMessage));
    }
};



//admin logout
function adminLogout(req,res){
    req.session.adminLogin = false
    res.redirect('/admin')
}




module.exports={
    getAdminpage,
    postAdminpage,
    adminLogout,
    userdetails,
    UserStatus,
    userSerch,
    getDashboard,
    getlatestOrders,
    getSalesGraph,
    postSalesReport
}