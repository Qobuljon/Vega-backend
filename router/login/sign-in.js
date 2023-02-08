const express = require("express")
const router = express.Router()
const {Admin, adminValidate } = require("../../models/adminSchema")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv/config")
const auth = require("../../middleware/auth")
const owner = require("../../middleware/admin")

router.get("/", [auth, owner], async(req, res)=>{
    try{
        let admins = await Admin.find()
        let onlyAdmins = admins.filter(a=> !a.owner)
        res.json({msg:"Successfully", admins: onlyAdmins, state: true })
    }   
    catch{
        res.json("something went wrong")
    }
})
router.post("/", async(req, res)=>{
    try{
        const {error} = adminValidate(req.body)
        if(error){
            return res.json({msg:error.details[0].message, user: {}, state: false })
        }
        const user = await Admin.findOne({username: req.body.username})
        if(!user){
            return res.json({msg:"username or password is incorrect", user: {}, state: false } )
        }
        const validUser = await bcrypt.compare(req.body.password, user.password)
        if(!validUser){
            return res.json({msg:"username or password is incorrect", user: {}, state: false })
        }
        let token = jwt.sign(
            { username: user.username, owner: user.owner }, 
            process.env.private_key)

        res.json({msg: "Successfully sign in", user: {token, owner: user.owner, name: user.name}, userInfo: { name: user.name, username: user.username, image: user.image, teachers: user.teachers, id: user._id } ,  state: true})
    }
    catch{
        res.json("something went wrong")
    }
})


router.delete("/:id", [auth, owner], async(req, res)=>{
    try{
        let deleteAdmin = await Admin.findByIdAndRemove(req.params.id)
        res.json({msg: "Successfully deleted", admin: deleteAdmin, state: true})
    }   
    catch{
        res.json("something went wrong")
    }
})

module.exports = router