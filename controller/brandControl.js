const brandCollection = require('../model/brand')


//To Catagories section details
async function  getBrand (req, res){
    if (req.session.adminLogin) {
        var i = 0;
        const brandData = await brandCollection.find({});
        // console.log(brandData);
        res.render('adminView/brand',{title:"brand details",brandData,i})
    } else {
        res.redirect("/admin");
    }
};

//add catogories
function getbrandsData(req,res){
    res.render('adminView/add-brand',{title:"add new brand",err:false})
}
//add post catogories
async function postbrandsData(req, res) {
  try {
      const { brandName } = req.body;

      // Check if a brand with the same name already exists
      const existingBrand = await brandCollection.findOne({ name: brandName });

      if (existingBrand) {
          // A brand with the same name already exists
          res.render('adminView/add-brand', { title: "add new brand", err: "Brand name already exists" });
      } else {
          const newBrand = new brandCollection({
              name: brandName,
              timeStamp: new Date(),
          });

          const insertResult = await newBrand.save();
          res.redirect('/admin/add-brand');
      }
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
}


//edit brand
async function getBrandedit(req,res){
  const id = req.params.id;
  const brandName = await brandCollection.findOne({_id: id})
  res.render('adminView/edit-brand',{title:"Edit brand",brandName})
}
// edit brand = brand view page
async function postBrandedit(req,res){
  let newData = req.body;
  let id = req.params.id;
  console.log(newData,id);
  const date=Date.now();
  await brandCollection.updateOne(
    {_id:id},{
      $set:{name:newData.brandName,timeStamp:date}
    }
  )
    res.redirect('/admin/brand')

  }

//Delete Brand
async function getBrandDelete(req,res){
  const id = req.params.id;
  console.log(id);
  await brandCollection.deleteOne({ _id : id })
  res.redirect('/admin/brand')
}


  module.exports = {
    getBrand,
    getbrandsData,
    postbrandsData,
    getBrandedit,
    postBrandedit,
    getBrandDelete
  }