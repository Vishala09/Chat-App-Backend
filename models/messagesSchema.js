var mongoose = require('mongoose');
var messagesSchema = mongoose.Schema({
    emailId:{type:String},
    toEmailId:{type:String},
    messageContent:[]
});

module.exports=mongoose.model('messages',messagesSchema);