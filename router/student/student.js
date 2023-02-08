const express = require("express")
const router = express.Router()
const { Students, studentsValidate, studentsValidate2 } = require("../../models/studentSchema")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv/config")
const auth = require("../../middleware/auth")
const owner = require("../../middleware/admin")





// Method: Get
// Desc : get all teachers
router.get("/all-students", async(req, res)=>{
    try{
        let students = await Students.find()
        res.json({msg:"Successfully",students, state: true })
    }   
    catch{
        res.json("something went wrong")
    }
})

// Method: Get
// Desc:   Get one Student by id
router.get("/:id", async (req, res) => {
    try {
      const student = await Students.findById(req.params.id);
  
      if (!student) {
        return res.status(404).json({
          state: false,
          msg: "not found",
          data: student,
        });
      }
  
      res.status(200).json({
        state: true,
        msg: "successfully found",
        data: [student],
      });
    } catch (err) {
      res.send(err);
    }
});



// Method : Post 
// Create STUDENT 
router.post("/sign-up",  async(req, res)=>{
    try{
        const {error} = studentsValidate(req.body)
        if(error){
            return res.json({msg:error.details[0].message, user: {}, state: false } )
        }
        const { name, username , password  , image , connection , desc } = req.body
        const user = await Students.findOne({username})
        if(user){
            return res.json({msg:"username is already been declared", user: {}, state: false } )
        }
        const newUser = await Students.create({username, password, name, image, connection,desc, student:true, mainLessons:[] , lessons:[], })
        const salt = await bcrypt.genSalt(10)
        newUser.password = await bcrypt.hash(newUser.password, salt)
        const savedUser = await newUser.save()
        res.json({msg:"successfully Student is saved", user: savedUser, state: true })
    }
    catch{
        res.json("something went wrong")
    }
})

// Method : Post
// sign-in
router.post("/sign-in", async(req, res)=>{
    try{
        const {error} = studentsValidate2(req.body)
        if(error){
            return res.json({msg:error.details[0].message, user: {}, state: false })
        }
        const user = await Students.findOne({username: req.body.username})
        if(!user){
            return res.json({msg:"username or password is incorrect", user: {}, state: false } )
        }
        const validUser = await bcrypt.compare(req.body.password, user.password)
        if(!validUser){
            return res.json({msg:"username or password is incorrect", user: {}, state: false })
        }
        let studentToken = jwt.sign(
            { username: user.username, student: user.student }, 
            process.env.private_key)

        res.json({msg: "Successfully sign in Student", user: {studentToken, id: user._id , student: user.student, userName: user.username, image: user.image, connection: user.connection, name: user.name, lessons: user.lessons , mainLessons: user.mainLessons}, state: true})
    }
    catch{
        res.json("something went wrong")
    }
})
// Method : Patch
  // add Main lessons
  router.patch("/add-mainLesson/:id", async(req, res)=>{
    try{
      const {id} = req.params
      const { mainLesson } = req.body
      if(!mainLesson){
        return res.status(200).json({
          state:false,
          msg:"Lesson is not found",
          data:mainLesson
        })
      }
      const updateStudentOne = await Students.findById(id)
      if (updateStudentOne.mainLessons.includes(mainLesson)) {
        return res.status(400).json({
          state:false,
          msg:"Lesson is added before",
          data:mainLesson
        })
      }
      const updateStudent = await Students.updateOne(
        {_id: id},
        {
          $set: {
            mainLessons: [...updateStudentOne.mainLessons ,mainLesson]
          }
        }
      );
      res.json({msg: 'This MainLesson is added ', data: updateStudent, state: true})
    }
    catch(err){
      res.json(err)
    }
  })


  // Method : Patch
  // add lessons
  router.patch("/add-lesson/:id", async(req, res)=>{
    try{
      const {id} = req.params
      const {lesson } = req.body
      if(!lesson){
        return res.status(200).json({
          state:false,
          msg:"Lesson is not found",
          data:lesson
        })
      }
      const updateStudentOne = await Students.findById(id)
      const updateStudent = await Students.updateOne(
        {_id: id},
        {
          $set: {
            lessons: [...updateStudentOne.lessons ,lesson]
          }
        }
      );
      res.json({msg: 'This Lesson is added ', data: updateStudent, state: true})
    }
    catch(err){
      res.json(err)
    }
  })


    // Method Delete
    // Delete Student 
    router.delete("/delete/:id", async(req, res)=>{
      try{
          let deleteStudent = await Students.findByIdAndRemove(req.params.id)
          res.json({msg: "Successfully deleted", teacher: deleteStudent, state: true})
      }   
      catch{
          res.json("something went wrong")
      }
  })


  module.exports = router