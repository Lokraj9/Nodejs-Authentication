const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const port = 8000;
const User = require("./models/userModels");
require("./db");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt=require("jsonwebtoken");
app.use(cors());
app.use(bodyParser.json());
function authenticate(req,res,next){
    const token=req.headers.authorization.split(' ')[1];
    // console.log("token: " + token);
    const {id}=req.body;
    if(!token){
        res.status(401).send({
            message:"Invalid token"
        })
    }
    try {
        const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY)
       if(id && decoded.id !== id){
            return res.status(401).json({
                message:"auth error"
            })
       }
       req.id=decoded;
        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message:"Invalid token"
        })
    }
}
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).send({
        message: "user already registered",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(200).send({
      message: "successfully registered",
    });
  } catch (error) {
    res.status(509).send({
      message: error.message,
    });
  }
});
app.post("/login", async (req, res) => {
  try {
    const { password, email } = req.body;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).send({
        message: "invalid credentials",
      });
    }
    const isPasswordCorrect=await bcrypt.compare(password, existingUser.password)
    if(!isPasswordCorrect){
        return res.status(404).send({
            message: "invalid credentials",
          });
    }
    const token=jwt.sign({id:existingUser._id},process.env.JWT_SECRET_KEY,{
        expiresIn:'1h'
    })
    res.status(200).send({
        token,
        message:"login successful"
    })
  } catch (error) {
    console.log("error", error);
  }
});
app.post('/getmyprofile',authenticate,async(req,res)=>{
    const {id}=req.body;
    const user=await User.findOne({id})
    user.password=undefined;
    res.status(201).json({user})
})
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
