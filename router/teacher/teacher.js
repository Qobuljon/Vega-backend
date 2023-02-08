const express = require("express")
const router = express.Router()
const { Teachers , teachersValidate, teachersValidate2 } = require("../../models/teacherSchema")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv/config")
const auth = require("../../middleware/auth")
const owner = require("../../middleware/admin")

const fs = require("fs");
const cloudinary = require("../../cloudinary");
const uploads = require("../../multer");
const { log } = require("console")

// Method: Get
// Desc : get all teachers
router.get("/all-teachers", async(req, res)=>{
    try{
        let teachers = await Teachers.find()
        res.json({msg:"Successfully", teachers: teachers, state: true })
    }   
    catch{
        res.json("something went wrong")
    }
})
// Method: Get
// Desc:   Get one Teacher by id
router.get("/single-teacher/:id", async (req, res) => {
    try {
      const teacher = await Teachers.findById(req.params.id);
  
      if (!teacher) {
        return res.status(404).json({
          state: false,
          msg: "not found",
          data: teacher,
        });
      }
  
      res.status(200).json({
        state: true,
        msg: "successfully found",
        data: [teacher],
      });
    } catch (err) {
      res.send(err);
    }
  });

  // Method: Get
// Desc:   Get one Teacher by id
router.get("/:id", async (req, res) => {
  try {
    const teacher = await Teachers.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        state: false,
        msg: "not found",
        data: teacher,
      });
    }

    res.status(200).json({
      state: true,
      msg: "successfully found",
      data: [teacher],
    });
  } catch (err) {
    res.send(err);
  }
});

// Method: Get
// see more
router.get("/see-more-teachers/:teacherCount", async (req,res) => {
  try{  
    const teacherCount = req.params.teacherCount
    const teachers = await Teachers.find().limit(teacherCount)
    res.json({state:true,data:teachers,msg:"Successfully" })

  }
  catch(err){
    res.json("smth went wrong")
  }
})


// Method : Post 
// Create tescher 
router.post("/sign-up/:creator_name", auth, uploads.array("image"),  async(req, res)=>{
    try{

      const uploader = async (path) => await cloudinary.uploads(path, "teachers");
      
      let urls = [];

      if (req.files) {
        const files = req.files;
        for (const file of files) {
          const { path } = file;
          const newPath = await uploader(path);
          urls.push(newPath);
          fs.unlinkSync(path);
        }
      }
      const { body } = req;
      const {error} = teachersValidate(body);

  
      // checking
      if (error) {
        return res.status(400).json({
          state: false,
          msg: error.details[0].message,
          data: [],
        });
      }
       
      const { creator_name }  = req.params


        let { username, password, name,  connection , desc, type , } = body

        const user = await Teachers.findOne({username})

        if(user){
            return res.json({msg:"username is already been declared", user: {}, state: false } )
        }

        const newUser = await Teachers.create({username, password, name, connection,desc, urls , type , creator: creator_name ,teacher:true, news:[], lessons:[], students:[] });
        const salt = await bcrypt.genSalt(10)
        newUser.password = await bcrypt.hash(newUser.password, salt)
        const savedUser = await newUser.save()
        res.json({msg:"successfully user is saved", user: savedUser, state: true })
    }
    catch{
        res.json("something went wrong")
    }
})


// Method : Post
// sign-in
router.post("/sign-in", async(req, res)=>{
    try{
        const {error} = teachersValidate2(req.body)
        if(error){
            return res.json({msg:error.details[0].message, user: {}, state: false })
        }
        const user = await Teachers.findOne({username: req.body.username})
        if(!user){
            return res.json({msg:"username or password is incorrect", user: {}, state: false } )
        }
        const validUser = await bcrypt.compare(req.body.password, user.password)
        if(!validUser){
            return res.json({msg:"username or password is incorrect", user: {}, state: false })
        }
        let teacherToken = jwt.sign(
            { username: user.username, teacher: user.teacher }, 
            process.env.private_key)

        res.json({msg: "Successfully sign in",  user: {teacherToken, id: user._id ,  teacher: user.teacher, userName: user.username, image: user.image, name: user.name}, state: true})
    }
    catch{
        res.json("something went wrong")
    }
})



 // Method : Patch
  // add news
  router.patch("/add-news/:id", async(req, res)=>{
    try{
      const {id} = req.params
      const { news } = req.body
      if(!news){
        return res.status(200).json({
          state:false,
          msg:"News are not found",
          data:news
        })
      }
      const updateTeacherOne = await Teachers.findById(id)
      const updateTeacher = await Teachers.updateOne(
        {_id: id},
        {
          $set: {
            news: [...updateTeacherOne.news ,news ]
          }
        }
      );
      res.json({msg: 'This News are updated', data: updateTeacher, state: true})
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
      const updateTeacherOne = await Teachers.findById(id)
      const updateTeacher = await Teachers.updateOne(
        {_id: id},
        {
          $set: {
            lessons: [...updateTeacherOne.lessons ,lesson ]
          }
        }
      );
      res.json({msg: 'This Thema is added ', data: updateTeacher, state: true})
    }
    catch(err){
      res.json(err)
    }
  })

 // Method : Patch
  // add students
  router.patch("/add-student/:id", async(req, res)=>{
    try{
      const {id} = req.params
      const { student } = req.body
      if(!student){
        return res.status(200).json({
          state:false,
          msg:"student is not found",
          data:student
        })
      }
      const updateTeacherOne = await Teachers.findById(id)
      const updateTeacher = await Teachers.updateOne(
        {_id: id},
        {
          $set: {
            students: [...updateTeacherOne.students ,student ]
          }
        }
      );
      res.json({msg: 'This student is added ', data: updateTeacher, state: true})
    }
    catch(err){
      res.json(err)
    }
  })


  // Method Delete
    // Delete teacher 
    router.delete("/delete/:id", async(req, res)=>{
        try{
            let deleteTeacher = await Teachers.findByIdAndRemove(req.params.id)
            res.json({msg: "Successfully deleted", teacher: deleteTeacher, state: true})
        }   
        catch{
            res.json("something went wrong")
        }
    })



module.exports = router