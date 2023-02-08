const mongoose = require("mongoose")
const Joi  = require("joi");
const { required } = require("joi");

const lessonSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    urls:{
        type:Array
    },
    desc:{
        type:String
    },
    password:{
        type:String,
        required:true
    },
    owner:{
        type:String
    },
    type:String,
    students:Number,
    like:Number,
    disLike:Number,
    comments:Array,
    lessons:Array
})

const Lessons = mongoose.model("lessons",lessonSchema);

const lessonsValidate = (body) => {
    const schema = Joi.object({
        title: Joi.string().required(),
        urls: Joi.required(),
        desc: Joi.string(),
        password: Joi.string().required(),
        owner: Joi.string(),
        type: Joi.string(),
        students: Joi.number(),
        like: Joi.number(),
        disLike: Joi.number(),
        comments: Joi.array(),
        lessons: Joi.array()
    })

    return schema.validate(body)
}


exports.Lessons =   Lessons;
exports.lessonsValidate = lessonsValidate;