const categoriesCollection = require('../model/categories')
const errorMiddleware = require('../middleware/errorMiddleware');

//To Catagories section details
async function getCategory(req, res, next) {
  try {
    var i = 0;
    const categoryData = await categoriesCollection.find({}).sort({timeStamp:-1});
    // console.log(categoryData);
    res.render('adminView/categories', { title: "categories details", categoryData, i });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

//add catogories
function getCatagoriesData(req,res, next){
  try{
    res.render('adminView/add-categories',{title:"add new categories",success:false,err:false})
  }catch (error) {
    console.error(error);
    next(error);
}
}

//add post catogories
async function postCatagoriesData(req, res, next) {
  try {
      const { categoryName } = req.body;
      const existingCategory = await categoriesCollection.findOne({ name: categoryName });

      if (existingCategory) {
          res.render('adminView/add-categories', { title: "add new categories", err: "Category name already exists" });
      } else {
          const newCategory = new categoriesCollection({
              name: categoryName,
              timeStamp: new Date(),
          });

          const insertResult = await newCategory.save();
          res.render('adminView/add-categories', { title: "add new categories",err:false,success: "Category added successfully" });
      }
  }catch (error) {
    console.error(error);
    next(error);
  }
}


//edit category
async function getCatagoriesedit(req,res, next){
  try{
    const id = req.params.id;
    const categoryName = await categoriesCollection.findOne({_id: id})
    res.render('adminView/edit-categories',{title:"Edit category",categoryName})
  }catch (error) {
    console.error(error);
    next(error);
  }
  }

  // edit category = category view page
  async function postCatagoriesedit(req, res, next) {
    try {
        const newData = req.body;
        const id = req.params.id;
        // console.log(newData, id);

        const existingCategoryCount = await categoriesCollection.countDocuments({ name: newData.categoryName });

        if (existingCategoryCount > 0) {
            console.log("This category already exists");
            res.redirect('/admin/category');
        } else {
            const date = Date.now();
            await categoriesCollection.updateOne(
                { _id: id },
                {
                    $set: { name: newData.categoryName, timeStamp: date }
                }
            );
            res.redirect('/admin/category');
        }
    } catch (error) {
      console.error(error);
      next(error);
    }
}


//Delete category
async function getCategoryDelete(req,res, next){
  try{
    const id = req.params.id
    console.log(id);
    await categoriesCollection.deleteOne({ _id:id })
    res.redirect('/admin/category')
  }catch (error) {
    console.error(error);
    next(error);
  }
}

module.exports={
    getCategory,
    getCatagoriesData,
    postCatagoriesData,
    getCatagoriesedit,
    postCatagoriesedit,
    getCategoryDelete
}