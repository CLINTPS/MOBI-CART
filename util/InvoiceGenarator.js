const easyinvoice = require('easyinvoice')
const fs = require('fs')
const path = require('path')
const nodemailer=require("nodemailer");
const {AUTH_EMAIL,AUTH_PASS}=process.env;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user:AUTH_EMAIL,
        pass:AUTH_PASS,
    }
});


module.exports = {
    generateInvoice: async (orderDetails,email) => {
        console.log("orderDetails Invoice genarator",orderDetails);
        // let mail=req.session.email
        console.log("invoice send mail-",email);
        try {
            var data = {
                
                "customize": {
                   
                },
    
                "images": {
                  
                    "logo": fs.readFileSync(path.join(__dirname, '..', 'public', 'images', 'Mobi Cart Logo.png'), 'base64'),                   
    
                },
                "sender": {
                    "company": "Mobi Cart",
                    "address": "369 Vtakara",
                    "zip": "673308",
                    "city": "Calicut",
                    "country": "Kerala"
                },
                "client": {
                    "company": orderDetails[0].Address.Name,
                    "address": orderDetails[0].Address.Address,
                    "zip": orderDetails[0].Address.Pincode,
                    "city": orderDetails[0].Address.City,
                    "state": orderDetails[0].Address.State,
                    "Mob No": orderDetails[0].Address.Mobile,
                },
                "information": {
                    "Order ID": orderDetails[0]._id,
                    "date": orderDetails[0].OrderDate,
                    "invoice date": orderDetails[0].OrderDate,
                },
                "products": (orderDetails[0].Items && orderDetails[0].Items.length > 0) ? orderDetails[0].Items.map((product) => ({
                    "quantity": product.quantity,
                    "description": product.productId.ProductName, 
                    "tax-rate": 18,
                    "price": product.productId.DiscountAmount
                })) : [],
                
    
                "bottom-notice": "Thank You For Your Purchase",
                "settings": {
                    "currency": "USD",
                    "tax-notation": "vat",
                    "currency": "INR",
                    "tax-notation": "GST",
                    "margin-top": 50,
                    "margin-right": 50,
                    "margin-left": 50,
                    "margin-bottom": 25
                },
    
          
        }

            const result = await easyinvoice.createInvoice(data);

            const filePath = path.join(__dirname, '..', 'pdf', `${orderDetails[0]._id}.pdf`);
            await fs.promises.writeFile(filePath, result.pdf, 'base64');

            const mailOptions = {
                from: AUTH_EMAIL,
                to: email, // The recipient's email address
                subject: 'Invoice',
                text: 'Please find the attached invoice',
                attachments: [
                    {
                        filename: 'invoice.pdf',
                        path: filePath,
                    },
                ],
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                } else {
                    console.log('Email sent:', info.response);
                }
            });
            
            return filePath;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
};