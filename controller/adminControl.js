const JWT = require('jsonwebtoken')
const userCollection=require('../model/user')
const categoriesCollection=require('../model/categories')




//Admin password and user id
const credential = {
    email: "clint@gmail.com",
    password: "000"
}

//admin page
function getAdminpage(req, res) {
    res.render('adminView/adminLog',{title:"admin-login"})
}

//Admin login to admin view page

function postAdminpage(req, res){
    if (req.body.email == credential.email && req.body.password == credential.password) {
        req.session.admin = req.body.email;
        // req.session.logged = true
        req.session.adminLogin = true
// jwt set        
        // const token= JWT.sign({admin_id:"8787"},process.env.SECRUET_KEY)
        // res.cookie("admin_token",token,{
        //     httpOnly:true,
        // })
        console.log("logined");
        // res.redirect('/dashboard')
        res.render("adminView/dashboard",{title:"Admin Dashboard"})
    } else {
        res.render('adminView/adminLog', { title: "admin paage", err: "Invalid Username or Password" })
    }
}

//To coustomer details
async function  userdetails (req, res){
    if (req.session.adminLogin) {
        var i = 0;
        const useData = await userCollection.find({});
        useData.forEach(data => {
            data.createdAt = new Date(data.createdAt);
        });
        // console.log(useData);
        res.render('adminView/customers',{title:"coustome details",useData,i})
    } else {
        res.redirect("/admin/userDetails");
    }
};


//To Catagories section details
async function  getCategory (req, res){
    if (req.session.adminLogin) {
        var i = 0;
        const categoryData = await categoriesCollection.find({});
        // console.log(categoryData);
        res.render('adminView/categories',{title:"categories details",categoryData,i})
    } else {
        res.redirect("/admin");
    }
};

//add catogories
function getCatagoriesData(req,res){
    res.render('adminView/add-categories',{title:"add new categories"})
}
//add post catogories
async function postCatagoriesData(req,res){
    try {
      const { categoryName } = req.body;
      console.log(categoryName);
  
      const newCategory = new categoriesCollection({
        name: categoryName,
        timeStamp: new Date(),
      });
  
      const insertResult = await categoriesCollection.insertMany([newCategory]);
      res.redirect('/admin/add-category');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }

//edit category
async function getCatagoriesedit(req,res){
    const id = req.params.id;
    const categoryName = await categoriesCollection.findOne({_id: id})
    res.render('adminView/edit-categories',{title:"Edit category",categoryName})
  }
  // edit category = category view page
  async function postCatagoriesedit(req,res){
    let newData = req.body;
    let id = req.params.id;
    console.log(newData,id);
    const date=Date.now();
    await categoriesCollection.updateOne(
      {_id:id},{
        $set:{name:newData.categoryName,timeStamp:date}
      }
    )
      res.redirect('/admin/category')
  
    }


//user block unblock
const UserStatus = async (req, res) => {
    const id = req.params.id;
    console.log("Recieve request "+id);

    // Find the user by ID
    const user = await userCollection.findOne({ _id: id });

    if (!user) {
        return res.status(404).send("User not found");
    }
    const newStatus = !user.status;
    await userCollection.updateOne(
        { _id: id },
        { $set: { status: newStatus } }
    );

    console.log(`User ${user.userName} is ${newStatus ? "unblocked" : "blocked"}`);
    res.redirect("/admin/userDetails");
};

//admin logout
function adminLogout(req,res){
   res.render('adminView/adminLog',{title: "admin page"})
}




module.exports={
    getAdminpage,
    postAdminpage,
    adminLogout,
    userdetails,
    UserStatus,
    getCategory,
    getCatagoriesData,
    postCatagoriesData,
    getCatagoriesedit,
    postCatagoriesedit

}