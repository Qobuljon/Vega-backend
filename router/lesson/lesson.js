// @ts-nocheck
const express = require("express");
const router = express.Router();
const { Lessons,lessonsValidate  } = require("../../models/lessonSchema");
const admin = require("../../middleware/admin");
const fs = require("fs");
const cloudinary = require("../../cloudinary");
const uploads = require("../../multer");
const { log } = require("console");


// Method: GET
// Desc:   Get all Lessons 

router.get("/all-lessons",admin, async (req,res) => {
    try{
        const lessons = await Lessons.find();

        // checking 
        if(!lessons.length){
            return res.status(404).json({
                state: false,
                msg: "not found",
                data: lessons, 
            })
        }

        res.status(200).json({
            state: true,
            msg: "successfully found",
            data: lessons,
          });

    }
    catch(err){
        res.json("smth went wrong ",err)
    }
})

// Method: Get
// see more
router.get("/see-more-lessons/:proCount", async (req,res) => {
  try{  
    const proCount = req.params.proCount
    const lessons = await Lessons.find().limit(proCount)
    res.json({state:true,data:lessons,msg:"Successfully" })

  }
  catch(err){
    res.json("smth went wrong")
  }
})
// Desc:   Get one Lesson by id
router.get("/single-lesson/:id", async (req, res) => {
  try {
    const lesson = await Lessons.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        state: false,
        msg: "not found",
        data: lesson,
      });
    }

    res.status(200).json({
      state: true,
      msg: "successfully found",
      data: [lesson],
    });
  } catch (err) {
    res.send(err);
  }
});




router.get("/special/:teacher_name", async (req,res) => {
    try{

        const { teacher_name } = req.params
        const lessons = await (await Lessons.find()).filter(lesson => lesson.owner === teacher_name)

        // checking 
        if(!lessons.length){
            return res.status(404).json({
                state: false,
                msg: "not found",
                data: lessons, 
            })
        }

        res.status(200).json({
            state: true,
            msg: "successfully found",
            data: lessons,
          });

    }
    catch(err){
        res.json("smth went wrong ",err)
    }
})


// Method: Get
// Desc:   Get one lesson by id
router.get("/:id", async (req, res) => {
    try {
      const lesson = await Lessons.findById(req.params.id);
  
      if (!lesson) {
        return res.status(404).json({
          state: false,
          msg: "not found",
          data: lesson,
        });
      }
  
      res.status(200).json({
        state: true,
        msg: "successfully found",
        data: [lesson],
      });
    } catch (err) {
      res.send(err);
    }
  });




  // Method: POST
// Desc:   Create a new lesson
router.post("/create/:teacher_name", uploads.array("image"),  async (req, res) => {
    try {
      const uploader = async (path) => await cloudinary.uploads(path, "lessons");
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
      const { error } = lessonsValidate(body);
      const { teacher_name } = req.params
      // checking
      if (error) {
        return res.status(400).json({
          state: false,
          msg: error.details[0].message,
          data: [],
        });
      }
  
      let {
        title,
        desc,
        password,
        type,
      } = body;
  
      const newLesson = await Lessons.create({
        title,
        urls,
        desc,
        password,
        type,
        owner:teacher_name,
        students:0,
        like:0,
        disLike:0,
        comments:[],
      });
  
      // checking
      if (!newLesson) {
        return res.status(400).json({
          state: false,
          msg: "can not create",
          data: newLesson,
        });
      }
  
      const savedLesson = await newLesson.save();
      // checking
      if (!savedLesson) {
        return res.status(400).json({
          state: false,
          msg: "can not saved",
          data: savedLesson,
        });
      }
  
      res.status(201).json({
        state: true,
        msg: "successfully created",
        data: savedLesson,
      });
    } catch (e) {
      res.json(`something went wrong: ${e}`);
    }
  });
  






// Method: DELETE
// Desc:   Remove a lesson by id (params)
router.delete("/:id",  async (req, res) => {
    try {
      const { id } = req.params;
      const removedLesson = await Lessons.findByIdAndDelete(id);
  
      // checking
      if (!removedLesson) {
        return res.status(404).json({
          state: false,
          msg: "not found",
          data: [],
        });
      }
  
      res.status(200).json({
        state: true,
        msg: "successfully deleted",
        data: removedLesson,
      });
    } catch (e) {
      res.json(`something went wrong: ${e}`);
    }
  });
  
// Method: PUT
// Desc:   Update a product by id (params)

router.put("/:id",  async (req, res) => {
    try {
      const { id } = req.params;
      
  
      const updatedLesson = await Lessons.findByIdAndUpdate(id, req.body);
  
      if (!updatedLesson) {
        return res.status(404).json({
          state: false,
          msg: "not found",
          data: [],
        });
      }
  
      res.status(200).json({
        state: true,
        msg: "successfully updated",
        data: updatedLesson,
      });
    } catch (e) {
      res.json(`something went wrong: ${e}`);
    }
  });
  
  // Method : Patch
  // add lesson Theme
  router.patch("/add-lesson/:id", async(req, res)=>{
  try{
    const {id} = req.params
    const { lesson } = req.body
    if(!lesson){
      return res.status(200).json({
        state:false,
        msg:"Lesson is not found",
        data:lesson
      })
    }
    const updateLessonOne = await Lessons.findById(id)
    const updateLesson = await Lessons.updateOne(
      {_id: id},
      {
        $set: {
          lessons: [...updateLessonOne.lessons ,lesson ]
        }
      }
    );
    res.json({msg: 'This Lesoon is updated', data: updateLesson, state: true})
  }
  catch(err){
    res.json(err)
  }
})

 // Method : Patch
  // add lesson Comment
  router.patch("/add-comment/:id", async(req, res)=>{
    try{
      const {id} = req.params
      const { comment } = req.body
      if(!comment){
        return res.status(200).json({
          state:false,
          msg:"Comment is not found",
          data:comment
        })
      }
      const updateLessonOne = await Lessons.findById(id)
      const updateLesson = await Lessons.updateOne(
        {_id: id},
        {
          $set: {
            comments: [...updateLessonOne.comments ,comment ]
          }
        }
      );
      
      res.json({msg: 'This Comment is added', data: updateLesson, state: true})
    }
    catch(err){
      res.json(err)
    }
  })


 // Method : Patch
  // add lesson Like
  router.patch("/like/:id", async(req, res)=>{
    try{
      const {id} = req.params
      
      const updateLessonOne = await Lessons.findById(id)
      const updateLesson = await Lessons.updateOne(
        {_id: id},
        {
          $set: {
            like: updateLessonOne.like + 1
          }
        }
      );
      
      res.json({msg: 'Liked ', data: updateLesson, state: true})
    }
    catch(err){
      res.json(err)
    }
  })

   // Method : Patch
  // add lesson Dislike
  router.patch("/dislike/:id", async(req, res)=>{
    try{
      const {id} = req.params
      
      const updateLessonOne = await Lessons.findById(id)
      const updateLesson = await Lessons.updateOne(
        {_id: id},
        {
          $set: {
            disLike: updateLessonOne.disLike + 1
          }
        }
      );
      
      res.json({msg: 'Disliked ', data: updateLesson, state: true})
    }
    catch(err){
      res.json(err)
    }
  })


module.exports = router;