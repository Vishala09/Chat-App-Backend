var mongoose = require('mongoose');
var messagesSchema = mongoose.Schema({
    emailId:{type:String},
    toEmailId:{type:String},
    messageContent:[],
    resetIndex:{}
});

module.exports=mongoose.model('messages',messagesSchema);