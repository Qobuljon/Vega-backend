// @ts-nocheck
const express = require("express");
const cors = require("cors")
const mongoose = require("mongoose")
require("dotenv/config")

const app = express();
require("./prod")(app);

app.use(express.json())
app.use(cors())

mongoose.connect(process.env.MONGODB_URL)
    .then(()=> console.log("Mongodb is connected"))
    .catch(()=> console.log("Mongodb is not connected"))

app.get('/', async(req,res)=> {
    res.send('App is running perfectly!')
})

app.use("/sign-up", require("./router/login/sign-up"))
app.use("/sign-in", require("./router/login/sign-in"))
app.use("/lesson", require("./router/lesson/lesson"))
app.use("/teacher", require("./router/teacher/teacher"))
app.use("/student",require("./router/student/student"))

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`server running on port: ${PORT}`));