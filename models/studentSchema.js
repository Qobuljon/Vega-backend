const mongoose = require("mongoose")
const Joi = require("joi")

const studentSchema = new mongoose.Schema({
    name: String,
    student:Boolean,
    username: {
        type: String,
    },
    password: {
        type: String,
    },
    image:{
        type:String
    },
    mainLessons:{
        type:Array
    },
    lessons:{
        type:Array
    },
    connection:{
        type:String
    },
    desc:{
        type:String
    }
})

const Students = mongoose.model("students", studentSchema)

const studentsValidate = (body)=>{
    const schema = Joi.object({
        name: Joi.string(),
        student: Joi.boolean(),
        username: Joi.string().min(3).max(50),
        password: Joi.string().min(8).max(50),
        image: Joi.string(),
        mainLessons: Joi.array(),
        lessons: Joi.array(),
        connection: Joi.string(),
        desc: Joi.string(),
    })
    return schema.validate(body)
}

const studentsValidate2 = (body)=>{
    const schema = Joi.object({
        username: Joi.string().min(3).max(50),
        password: Joi.string().min(8).max(50),
    })
    return schema.validate(body)
}
exports.Students = Students
exports.studentsValidate = studentsValidate
exports.studentsValidate2 = studentsValidate2