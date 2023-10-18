const categoriesCollection = require('../model/categories')

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

//Delete category
async function getCategoryDelete(req,res){
    const id = req.params.id
    console.log(id);
    await categoriesCollection.deleteOne({ _id:id })
    res.redirect('/admin/category')
}

module.exports={
    getCategory,
    getCatagoriesData,
    postCatagoriesData,
    getCatagoriesedit,
    postCatagoriesedit,
    getCategoryDelete
}