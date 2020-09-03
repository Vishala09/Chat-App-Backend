var express=require('express');
var router=express.Router();
const Message=require('../models/messagesSchema');
const Backup=require('../models/backupSchema');
const User=require('../models/usersSchema');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');

router.get('/getBackup',(req,res,next) => {
    console.log("getting back up",req.query);
    let query = Message.find(
        { $or: [{ emailId:req.query.sender, toEmailId:req.query.receiver }, { emailId:req.query.receiver,toEmailId:req.query.sender }] }
    );
    query.exec(function(err,messages){
        Backup.find(
            { personA:req.query.sender, personB:req.query.receiver }
        )
        .then((retrievedBackup) => {
            let startIndex=0;
            if(messages[0]  && messages[0].resetIndex[0] && messages[0].resetIndex[0].by && messages[0].resetIndex[0].by==req.query.sender)
            startIndex=messages[0].resetIndex[0].index;
            else if(messages[0]  && messages[0].resetIndex[1] && messages[0].resetIndex[1].by && messages[0].resetIndex[1].by==req.query.sender)
            startIndex=messages[0].resetIndex[1].index;
            else
            startIndex=0;
            if(retrievedBackup.length!=0)
            {
                Backup.deleteOne({ personA:req.query.sender, personB:req.query.receiver }).then(function(){ 

   // console.log("Data deleted",messages[0].messageContent.slice(startIndex,messages[0].messageContent.length)); // Success 
                     
                    var newBackup=new Backup({
                        personA:req.query.sender,
                        personB:req.query.receiver,
                        messageContent:messages[0].messageContent.slice(startIndex+1,messages[0].messageContent.length),
                        backupBy:req.query.sender
                     });
                        newBackup.save((err,backup) => {
                            console.log("Successfully stored in cloud",req.query);
                            if(err)
                            res.status(500).send({msg:'Sorry , there was a problem.  please try again after sometime'});

                            res.status(200).send({msg:'Successfully stored in cloud'});
                        });
                }).catch(function(error){ 
                    console.log(error); // Failure 
                }); 
            
            //    Backup.update({_id:retrievedBackup._id},{ $push:{ messageContent: {message:messages.slice(index,messages.length)} }}).exec();
            //     Backup.update({_id:retrievedBackup._id},{ $push:{ messageContent: {backup:'backup',by:req.query.sender} }}).exec();
            //     Message.update({_id:messages[0]._id},{ $push:{ messageContent: {backup:'backup',by:req.query.sender} }}).exec();
              
            }
            else
            {   console.log('new entry',startIndex)
                var newBackup=new Backup({
                                    personA:req.query.sender,
                                    personB:req.query.receiver,
                                    messageContent:messages[0].messageContent.slice(startIndex,messages[0].messageContent.length),
                                    backupBy:req.query.sender
                                 });
                                 
                newBackup.save((err,backup) => {
                    console.log("Successfully stored in cloud",req.query);
                   // Backup.update({_id:backup._id},{ $push:{ messageContent: {backup:'backup',by:req.query.sender} }}).exec();
                  //  Message.update({_id:messages[0]._id},{ $push:{ messageContent: {backup:'backup',by:req.query.sender} }}).exec();
                  if(err)
                  res.status(500).send({msg:'Sorry , there was a problem.  please try again after sometime'});

                  res.status(200).send({msg:'This is your first backup.Successfully stored in cloud'});
                });
            }
        })
    })

    
});

router.get('/resetData',(req,res,next) => {
    console.log("resetData",req.query);
    let query = Message.find(
       { $or: [{ emailId:req.query.sender, toEmailId:req.query.receiver }, { emailId:req.query.receiver,toEmailId:req.query.sender }]}
    )
    query.exec(function(err,messages){
        
        console.log('messages');
        if(messages)
        {
            let resetQuery = Message.find(
                { $or: [{ emailId:req.query.sender, toEmailId:req.query.receiver }, { emailId:req.query.receiver,toEmailId:req.query.sender }],
                   "messageContent":{reset:'reset',by:req.query.sender} 
                }
            )
            resetQuery.exec(function(err,resetMessages){
                console.log('resetmessages');
                  if(resetMessages.length!=0)
                  {
                    Message.updateOne( {_id:messages[0]._id}, { $pull: { messageContent: {reset:'reset',by:req.query.sender} } } ).exec();
                    Message.updateOne( {_id:messages[0]._id}, { $pull: {resetIndex:{by:req.query.sender} } }).exec();
                    Message.updateOne({_id:messages[0]._id},{ $push:{ messageContent: {reset:'reset',by:req.query.sender} }}).exec();
                    Message.updateOne({_id:messages[0]._id},{ $push:{ resetIndex:{ index:messages[0].messageContent.length-1,by:req.query.sender }}}).exec();
                    console.log('reset done again');
                    res.status(200).send({msg:'Reset done again'});
                  }
                  else
                  {
                    console.log('First time reset');
                    Message.updateOne({_id:messages[0]._id},{ $push:{ messageContent: {reset:'reset',by:req.query.sender} }}).exec();
                    Message.updateOne({_id:messages[0]._id},{ $push:{ resetIndex:{ index:messages[0].messageContent.length-1,by:req.query.sender } }}).exec();
                    res.status(200).send({msg:'First time reset'});
                  }
            })
           
        }
        else
        {
           
            
        }
    })
    
    
});

module.exports=router;