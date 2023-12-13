const user = require("../model/user")


const checkBlock = async (req, res, next) => {
    const check = await user.findOne({ email: req.session.email })
    if (check && check.status == false) {
        console.log("user block done cannot access...........");
        req.session.logged = false
        res.redirect('/')
    } else {
        next()
    }

}


module.exports = checkBlock;