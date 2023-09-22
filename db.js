const mongoose = require('mongoose')
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log('connected to the databse')
})
.catch((err)=>{
    console.log("failed to connect to the databse"+err)
})
