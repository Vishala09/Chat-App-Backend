var express=require('express');
var router=express.Router();
const Message=require('../models/messagesSchema');
const User=require('../models/usersSchema');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');

router.get('/getContacts',(req,res,next) => {
    var decodedjwt = jwt.verify(req.headers['authorization'],'secret');
    //console.log(decodedjwt.emailId)
    let query = Message.find({
        emailId:decodedjwt.emailId
    }).select('toEmailId')
    query.exec(function (err, toEmailId) {
        if (err) return next(err);
        //console.log(toEmailId);
        res.status(200).send(toEmailId);
    });
});

router.get('/getContactsData',(req,res,next) => {
    let contactsData=[];
    let toEmailId = req.query.toEmailId;
    //console.log("user email id",toEmailId)
    let query = Message.find(
        { $or: [{ emailId: toEmailId }, { toEmailId: toEmailId }] }
    ).select('toEmailId emailId')
    query.exec(function (err, toEmailIdUsers) {
        let useEmail;
       
      //  console.log("emailidusers",toEmailIdUsers,toEmailIdUsers.length);
        for(let i=0;i<toEmailIdUsers.length;i++)
        {
            if(toEmailIdUsers[i].toEmailId == toEmailId)
            {
                emailId = toEmailIdUsers[i].emailId;
              //  console.log('emailId')
            }
            else
            {
              //  console.log('toemailId')
                emailId = toEmailIdUsers[i].toEmailId
            }
         //    console.log(toEmailIdUsers.toEmailId,toEmailId,emailId)
             let query = User.findOne({
                emailId:emailId
            });
            query.exec(function (err, user) {
                contactsData.push(user);
           //     console.log('user',user);
                if(i===toEmailIdUsers.length-1)
                {
                //    console.log("contactsData",contactsData,i);
                    res.status(200).send(contactsData);;
                }
            });
        }
       
    });
});

router.get('/getUser',(req,res,next) => {
    let emailId = req.query.emailId;
    let query = User.findOne({
        emailId:emailId
    });
    query.exec(function (err, user) {
        if (err) return next(err);
     //   console.log(user);
        res.status(200).send(user);
    });
});


  
    function storeMessages(sender,receiver,message)
    {
        var messageData=new Message({ emailId:sender, toEmailId:receiver });
        messageData.messageContent.push({message:message,sent:sender});
        let senderData = Message.findOne({emailId:sender,toEmailId:receiver}).exec();
        senderData.then(function(doc){
            if(doc) {
                console.log("Sender email is in database.");
                    Message.update({_id:doc._id},{ $push:{ messageContent: {message:message,sent:sender} }}).exec();
            }
            else {
                var messageData2=new Message({ emailId:receiver, toEmailId:sender });
                messageData2.messageContent.push({message:message,sent:sender});
                let receiverData = Message.findOne({emailId:receiver,toEmailId:sender}).exec();
                {
                    receiverData.then(function(doc){
                        if(doc) {
                            console.log("Sender email is in database as receiver.");
                            Message.update({_id:doc._id},{ $push:{ messageContent: {message:message,sent:sender} }}).exec();
                        }
                        else {
                            
                            console.log("Sender email is not in database.");
                            messageData.save((err,user) => {
                                console.log("Message store successfully");
                                 
                              });
                        }
                     
                       });
                }
               
            }
         
           });
    }
    
    router.get('/getMessages',(req,res,next) => {
            console.log(req.query);
            let query = Message.find(
                { $or: [{ emailId:req.query.sender, toEmailId:req.query.receiver }, { emailId:req.query.receiver,toEmailId:req.query.sender }] }
            ).select('messageContent resetIndex');
            
            query.exec(function (err, messages) {
                if (err) return next(err);
               // console.log(messages);
                if(messages[0] && messages[0].messageContent.length!=0)
                {
                    console.log('getting msg',messages);
                    res.status(200).send({messages:messages[0]});
                }
                else
                {
                    console.log("no messageContent")
                    res.status(200).send({messages:messages[0]});
                }
            });
        });

    
    
  exports.router=router;
  exports.storeMessages=storeMessages;