const jwt = require("jsonwebtoken")
require("dotenv/config")

module.exports = function  auth(req, res, next){
    const token = req.header("token")
    if(!token){
        return res.status(401).json({msg:"Token is not defined", state: false})
    }
    try{
        const decoded = jwt.verify(token, process.env.private_key)
        req.isOwner = decoded
        next()
    }
    catch{
        return res.status(408).json({msg: "Invalid token", state: false})
    }

}
