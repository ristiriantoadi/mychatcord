const path=require('path');
const http=require('http');
const express=require("express");
const socketio=require("socket.io");

const app=express();
const server=http.createServer(app);
const io=socketio(server);
const formatMessage=require('./utils/messages');
const { userJoin, getCurrentUser, userLeaves,getRoomUsers }=require('./utils/users');



//set static folder
app.use(express.static(path.join(__dirname,'public')));

//run when client connect
io.on("connection",socket=>{
    console.log("new ws connection");
    const botName="ChatBot";
    let user;

    //user join room
    socket.on('joinRoom',({username,room})=>{
        user= userJoin(socket.id,username,room);
        
        socket.join(user.room)

        //welcome user
        socket.emit('message',formatMessage(botName,`Welcome to chatcord`));
        
    
        //broadcast when a user connects
        socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} has joined the chat`));

        //send users and room info
        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users:getRoomUsers(user.room)
        });
        // console.log()
    })

    //get chat message
    socket.on('chatMessage',(msg)=>{
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    });

    //user disconnect
    socket.on('disconnect',()=>{
        const user=userLeaves(socket.id);
        if(user){
            io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`));
        }
    });

    

});

const PORT=3000 || process.env.port;

server.listen(PORT,()=>console.log("Server running on port "+PORT));