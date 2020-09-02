var mongoose = require('mongoose');
var usersSchema = mongoose.Schema({
    userId:{type:String},
    emailId:{type:String},
    password:{type:String}
});
var bcrypt = require('bcrypt');

usersSchema.statics.hashPassword = function hashPassword(password){
    return bcrypt.hashSync(password,10);
}

usersSchema.methods.isValid = function(hashedpassword){
    return  bcrypt.compareSync(hashedpassword, this.password);
}

module.exports=mongoose.model('users',usersSchema);