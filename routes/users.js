var express=require('express'); 
var router=express.Router();
const User=require('../models/usersSchema');
var jwt = require('jsonwebtoken');

router.use('/register',(req,res,next) => {
    console.log("register user->",req.body);
     var newUser=new User({
        userId:req.body.userId,
        emailId:req.body.emailId,
        password: User.hashPassword(req.body.password)
     });
     User.findOne({
         emailId:req.body.emailId
     })
     .then((retrievedUser) => {
         if(!(retrievedUser))
         {
            newUser.save((err,user) => {
                //console.log(user,"newuser");
                  //if(err)
                    //  res.status(500).json({msg:"Sorry couldn't register. "+err});

                  console.log("User registered successfully");
                 return res.status(200).json({msg:"User registered successfully"});
              })
         }
         else
         {
            console.log("User already exixts");
           return res.status(500).json({msg:"User already exists"});
         }
     })
  });

  router.use('/login',(req,res,next) => {
      console.log("Logging-")
    let loginUser = User.findOne({emailId:req.body.emailId}).exec();
    console.log(loginUser);
    loginUser.then(function(doc){
     if(doc) {
       if(doc.isValid(req.body.password)){
           // generate token
           let token = jwt.sign({userId:doc.userId,isLoggedIn:true,emailId:doc.emailId},'secret', {expiresIn : '3h'});
            console.log("login success",loginUser);
           return res.status(200).json({msg:'Successfully loggedIn',user:loginUser,emailId:doc.emailId,token:token});
  
       } else {
         console.log(" Invalid Credentials");
         return res.status(500).json({msg:' Invalid Credentials'});
       }
     }
     else {
       console.log("User email is not registered.");
       return res.status(500).json({msg:'User email is not registered.'})
     }
  
    });
  });

  router.get('/getCurrentUser',(req,res,next) => {
      var decodedjwt = jwt.verify(req.headers['authorization'],'secret');
      User.findOne({
          emailId:decodedjwt.emailId
      })
      .then((user) => {
        res.status(200).json({isLoggedIn:true,emailId:user.emailId,userId:user.userId});
      })
  });
  
  
  
  
  router.get('/getAllUsers',(req,res,next) => {
    console.log("Getting all users");
    var decodedjwt = jwt.verify(req.headers['authorization'],'secret');
    let query = User.find({}).select('emailId');
    query.exec(function (err, emailId) {
        if (err) return next(err);
        console.log("emailId",emailId);
        res.status(200).send({emailIds:emailId});
    });
});

  module.exports=router;