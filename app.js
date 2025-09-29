const express = require("express")
const app = express()
const path = require("path")
const userModel = require("./models/user")
const postModel = require("./models/post")
const cookieParser = require("cookie-parser")
const bcrypt=require('bcrypt')
const jwt = require("jsonwebtoken")

app.set("view engine","ejs")
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,'public')))
app.use(cookieParser())

app.get('/',(req,res)=>{
    res.render('index.ejs') 
})
app.get('/login',(req,res)=>{
    res.render('login.ejs') 
})
app.get('/profile',isLoggedIn,(req,res)=>{
    console.log(req.user);
    res.render('login.ejs') 
})
app.post('/login',async(req,res)=>{
    let{email,password,username,name,age}=req.body;
    let user = await userModel.findOne({email})
    if(!user) return res.status(500).send("something went wrong")

    bcrypt.compare(password,user.password,function(err,result){
        if(result){
            let token = jwt.sign({email:email,userid:user._id},"shhhh")
            res.cookie("token",token)
            res.status(200).send("you can login")
        }
        else res.redirect("/login")
    })
})
app.get("/logout",(req,res)=>{
    res.cookie("token","")
    res.redirect("/login")
})
app.post('/register',async(req,res)=>{
    let{email,password,username,name,age}=req.body;
    let user = await userModel.findOne({email})
    if(user) return res.status(500).send("User already registered")

    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(password,salt,async (err,hash)=>{
            let user = await userModel.create({
                username,
                email,
                age,
                name,
                password:hash

            })
            let token = jwt.sign({email:email,userid:user._id},"shhhh")
            res.cookie("token",token)
            res.send("done")
        })
    })
})
function isLoggedIn(req,res,next){
    if(req.cookies.token =="")res.send("you must be logged in ");
    else{
        let data = jwt.verify(req.cookies.token,"shhhh");
        req.user = data;
        next();
}
    
}
app.listen(3000)