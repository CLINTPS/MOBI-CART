const bannerCollection = require('../model/banner')
const sharp = require('sharp')
const fs = require('fs');
const path = require('path');


//Get banneer page
async function getBanner(req,res,next){
    try{
        const CurrentBanner = await bannerCollection.find({}).limit(1).sort({date:-1})
        // console.log("CurrentBanner.......",CurrentBanner);
        res.render('adminView/banner',{title:"Banner",CurrentBanner})
    } catch (error) {
    console.error(error);
    next(error);
  }
}

//Post new banner image
const postNewBanner = async (req, res) => {
    // console.log("......",req.body);
        try {
            const uploadedImage = req.file;
            // console.log("uploadedImage..",uploadedImage);
    
            if (!uploadedImage) {
                console.log('Image is not found');
            }
    
            const supportedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/tiff', 'image/avif'];
    
            if (!supportedFormats.includes(uploadedImage.mimetype)) {
                console.log('This formate is not supported');
                return res.redirect('/Banner');
            }
            const imageBuffer = fs.readFileSync(uploadedImage.path);
            
            const croppedImageBuffer = await sharp(imageBuffer)
                .resize({ width: 750, height: 279, fit: sharp.fit.cover })
                .toBuffer();
            // console.log("image cropp image success....",croppedImageBuffer);
            const savePath = path.join(__dirname, '../public/banner-img/croppedImage');
            const fileName = uploadedImage.originalname;
            // console.log("savePath.....",savePath);
            fs.writeFileSync(path.join(savePath, fileName), croppedImageBuffer);
            const currentDate = new Date();
            const newBanner = new bannerCollection({
                image: fileName,
                date: currentDate,
            });
    
    
            const savedBanner = await newBanner.save();
            // const CurrentBanner = await bannerCollection.findOne({},{ sort: { date: -1 } });
            // console.log('CurrentBanner.image:', CurrentBanner.image);
    
            if (savedBanner) {
                // console.log('Banner added');
                res.redirect('/admin/Banner')
            } else {
                // console.log('Error saving the banner');
                res.render('errorView/404admin')
            }
        } catch(err){
            console.log(err);
            res.render('errorView/404admin')
          }
    };
    

module.exports={
    getBanner,
    postNewBanner
}