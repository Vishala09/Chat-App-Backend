var express = require('express')
var cors = require('cors')
var bodyParser = require('body-parser')
var app = express()
const mongoose = require('mongoose');
var socket = require('socket.io')
var port = process.env.PORT || 3000

app.use(cors({
  origin:['http://localhost:4200'],credentials:true
}));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

const mongoURI = 'mongodb+srv://Vishala:R2zMFzMooob3VPPV@shopping-dzdqf.mongodb.net/chatapp?retryWrites=true&w=majority';
//'mongodb://localhost:27017/meanloginreg'

mongoose
  .connect(
    mongoURI,
    { useNewUrlParser: true,useUnifiedTopology: true }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err))

var userRoutes=require('./routes/users');
app.use(userRoutes);
var messageRoutes=require('./routes/messages');
app.use(messageRoutes.router);

var server = app.listen(port, function() {
  console.log('Server is running on port: ' + port)
})
const Message=require('./models/messagesSchema');
var io = socket(server);
var users=[]
io.on('connection',(socket) => {
    console.log("New Connection",socket.id);
    socket.on('chat',function(data){ 
      io.sockets.emit('chat',data)
    });
    socket.on('typing',function(data){
      io.sockets.emit('typing',data)
    });
    socket.on('user_connected',function(emailId){
      console.log("emailId:",emailId);
      users[emailId]=socket.id;
      io.emit('user_connected',emailId);

  });
  socket.on("send_message", function (data) {
    // send event to receiver
    messageRoutes.storeMessages(data.sender,data.receiver,data.message);
    console.log("srm",data.sender,data.receiver,data.message);
    
    var socketId = users[data.receiver];
    io.to(socketId).emit("new_message",{message:data.message,receiver:data.receiver});
});
    
})

