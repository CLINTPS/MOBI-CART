const brandCollection = require('../model/brand')


//To Catagories section details
async function  getBrand (req, res){
    if (req.session.adminLogin) {
        var i = 0;
        const brandData = await brandCollection.find({});
        console.log(brandData);
        res.render('adminView/brand',{title:"brand details",brandData,i})
    } else {
        res.redirect("/admin");
    }
};

//add catogories
function getbrandsData(req,res){
    res.render('adminView/add-brand',{title:"add new brand"})
}
//add post catogories
async function postbrandsData(req,res){
    try {
      const { brandName } = req.body;
      console.log(brandName);
  
      const newBrand = new brandCollection({
        name: brandName,
        timeStamp: new Date(),
      });
  
      const insertResult = await brandCollection.insertMany([newBrand]);
      res.redirect('/admin/add-brand');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }

  module.exports = {
    getBrand,
    getbrandsData,
    postbrandsData
  }