const user = require("../model/user")


const checkBlock = async (req, res, next) => {
    // console.log(req.session.email);
    const check = await user.findOne({ email: req.session.email })
    // console.log("user block checking"+check);
    if (check && check.status == false) {
        console.log("user block done cannot access...........");
        req.session.logged = false
        res.redirect('/')
    } else {
        next()
    }

}
module.exports = checkBlock;