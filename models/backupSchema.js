var mongoose = require('mongoose');
var backupSchema = mongoose.Schema({
    personA:{type:String},
    personB:{type:String},
    backupBy:{type:String},
    messageContent:[]
});

module.exports=mongoose.model('backup',backupSchema);