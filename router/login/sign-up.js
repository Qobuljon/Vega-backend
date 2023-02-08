const express = require("express")
const router = express.Router()
const {Admin, adminValidate } = require("../../models/adminSchema")
const bcrypt = require("bcrypt")
const auth = require("../../middleware/auth")
const admin = require("../../middleware/admin")


router.post("/", [ auth, admin ], async(req, res)=>{
    try{
        const {error} = adminValidate(req.body)
        if(error){
            return res.json({msg:error.details[0].message, user: {}, state: false } )
        }
        const {username, password, name,image} = req.body
        const user = await Admin.findOne({username})
        if(user){
            return res.json({msg:"username is already been declared", user: {}, state: false } )
        }
        const newUser = await Admin.create({username, password, name, image, teachers:[], owner: false})
        const salt = await bcrypt.genSalt(10)
        newUser.password = await bcrypt.hash(newUser.password, salt)
        const savedUser = await newUser.save()
        res.json({msg:"successfully user is saved", user: {username, name}, state: true })
    }
    catch{
        res.json("something went wrong")
    }
})
module.exports = router