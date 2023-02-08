module.exports = function  auth(req, res, next){
    if(!req.isOwner.owner){
        return res.json({msg:"Request is denied", state: false});
    }
    next()
}