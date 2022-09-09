const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const path = require("path");
const formatMessage = require("./utils/messages");
const {userJoin, getCurrentUser, userLeaves, getRoomUsers} = require("./utils/users");


const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = 3000 || process.env.PORT;

const bot = "ChatBot";

//add the static page
app.use(express.static(path.join(__dirname,"public")));

//callback function when client connects
io.on('connect', socket => {
  //get user info
  socket.on('joinRoom', (obj) =>{
    var user = userJoin(socket.id, obj.username, obj.room);
    socket.join(user.room);
    //welcome message to new user
    socket.emit('message',formatMessage(bot,"Welcome to ChatCord!"));

    //send notification when new user joins
    socket.broadcast.to(user.room).emit('message',formatMessage(bot,`${user.username} has joined the chatroom.`));

    //send user info
    io.to(user.room).emit('roomUsers',{
      room: user.room,
      users: getRoomUsers(user.room)
    });

  });

  //when new messages are there
  socket.on('chatMessage', (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('message',formatMessage(user.username,msg));
  });

  //when client disconnects
  socket.on('disconnect',() => {
    const user = userLeaves(socket.id);
    if (user){
      io.to(user.room).emit('message',formatMessage(bot,`${user.username} has left the chat room.`));
      //update users when someone leaves
      io.to(user.room).emit('roomUsers',{
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
    
  });

});

server.listen(PORT, function(){
  console.log(`server started on port ${PORT}`);
});
