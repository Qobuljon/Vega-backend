const mongoose = require("mongoose");
const Joi = require("joi");

const teacherSchema = new mongoose.Schema({
    name: String,
    teacher:Boolean,
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    urls:{
        type:Array
    },
    connection:{
        type:String,
    },
    desc:{
        type:String
    },
    type:{
        type:String
    },
    news:{
        type:Array
    },
    lessons:{
        type:Array
    },
    students:{
        type:Array
    },
    creator:{
        type:String,
    }
})

const Teachers = mongoose.model("teachers", teacherSchema)

const teachersValidate = (body) => {
    const schema = Joi.object({
        name: Joi.string(),
        teacher: Joi.boolean(),
        username: Joi.string().required().min(3).max(50),
        password: Joi.string().required().min(8).max(1240),
        urls: Joi.required(),
        connection: Joi.string(),
        desc: Joi.string(),
        type: Joi.string(),
        news: Joi.array(),
        lessons: Joi.array(),
        students: Joi.array(),
        creator: Joi.string(),
    })

    return schema.validate(body);
}

const teachersValidate2 = (body) => {
    const schema = Joi.object({
        username: Joi.string().required().min(3).max(50),
        password: Joi.string().required().min(8).max(1240),
    })

    return schema.validate(body);
}
exports.Teachers = Teachers;
exports.teachersValidate = teachersValidate ;
exports.teachersValidate2 = teachersValidate2 ;