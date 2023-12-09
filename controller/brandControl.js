const brandCollection = require('../model/brand')


//To Barnd section details
async function  getBrand (req, res){
  try{
    var i = 0;
    const brandData = await brandCollection.find({});
    // console.log(brandData);
    res.render('adminView/brand',{title:"brand details",brandData,i})

  }catch(err){
    console.log(err);
    res.render('errorView/404admin')
  }
};

//add brand
function getbrandsData(req,res){
    res.render('adminView/add-brand',{title:"add new brand",success:false,err:false})
}
//add post brand
async function postbrandsData(req, res) {
  try {
      const { brandName } = req.body;

      // Check if a brand with the same name already exists
      const existingBrand = await brandCollection.findOne({ name: brandName });

      if (existingBrand) {
          // A brand with the same name already exists
          res.render('adminView/add-brand', { title: "add new brand", err: "Brand already exists" });
      } else {
          const newBrand = new brandCollection({
              name: brandName,
              timeStamp: new Date(),
          });

          const insertResult = await newBrand.save();
          res.render('adminView/add-brand', { title: "add new brand",err:false, success: "Brand added succesfully" });
      }
  }
  catch(err){
    console.log(err);
    res.render('errorView/404admin')
  } 
}


//edit brand
async function getBrandedit(req,res){
  try{
    const id = req.params.id;
    const brandName = await brandCollection.findOne({_id: id})
    res.render('adminView/edit-brand',{title:"Edit brand",brandName})
  }catch(err){
    console.log(err);
    res.render('errorView/404admin')
  } 
}

// edit brand = brand view page
async function postBrandedit(req, res) {
  try {
      const newData = req.body;
      const id = req.params.id;
      // console.log(newData, id);

      const existingBrandCount = await brandCollection.countDocuments({ name: newData.brandName });

      if (existingBrandCount > 0) {
          console.log("This brand is already exist");
          res.redirect('/admin/brand');
      } else {
          const date = Date.now();
          await brandCollection.updateOne(
              { _id: id },
              {
                  $set: { name: newData.brandName, timeStamp: date }
              }
          );
          res.redirect('/admin/brand');
      }
  } catch (err) {
      console.log(err);
      res.render('errorView/404admin');
  }
}


//Delete Brand
async function getBrandDelete(req,res){
  try{
    const id = req.params.id;
    // console.log(id);
    await brandCollection.deleteOne({ _id : id })
    res.redirect('/admin/brand')
  }catch(err){
    console.log(err);
    res.render('errorView/404admin')
  } 
}


  module.exports = {
    getBrand,
    getbrandsData,
    postbrandsData,
    getBrandedit,
    postBrandedit,
    getBrandDelete
  }