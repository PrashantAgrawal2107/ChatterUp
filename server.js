import express from 'express';
import { Server } from 'socket.io';
import cors from 'cors';
import http from 'http';
import { MessageModel } from './schema/message.schema.js';
import { UserModel } from './schema/user.schema.js';
import path from 'path';

// Create express app
const app = express();
app.use(cors());

// Create HTTP server 
export const server  = http.createServer(app);

app.use(express.static('client'));

app.get('/',(req,res)=>{
    console.log('Sending HTML page');
    res.sendFile(path.join(path.resolve(),'client','client.html'));
})


// Create Socket server
const io = new Server(server , {
    // CORS Configuration
    cors : {   
        origin : '*',
        methods : ['GET' , 'POST']
    }
});

//Use Socket events and handle client Connection
io.on('connection' , (socket)=>{
    console.log('Connection established');

    // All code for different events -----

    // Event listner to listen 'join' event emmitted by client-->>
    socket.on('join' ,async (username)=>{

        // Storing user in database--
        const newUser = new UserModel({
            username : username
        })
        await newUser.save();

        // Getting all current users from the database and sending it to client--
        await UserModel.find().then(users=>{
                // Emitting 'add-users' event to client--
                io.emit('add-users', users);
           }).catch(err=>{
                console.log(err);
           });


        // Adding username to socket object--
        socket.username = username;
        socket.userId= newUser._id;
        socket.emit("message", { text: `Welcome, ${username}!` });
        socket.broadcast.emit("user-joined", {
            text: `${username} has joined the room.`,
            username : username
        });
        
        // Getting previous chat from the database and sending it to client--
        await MessageModel.find().sort({timestamp : -1}).limit(25)
           .then(messages=>{
                // Emitting 'load-messages' event to send messages to client--
                socket.emit('load-messages', messages);
           }).catch(err=>{
                console.log(err);
           });

    }) 

    // Event listener to listen 'new-message' event emmitted by client-->>
    socket.on('new-message' , async (message)=>{
        // Creating userMessage object contaning both username and message--
        const userMessage = {
            username : socket.username,
            text : message,
            timestamp : new Date()
        }

        // Storing chat in database--
        const newChat = new MessageModel({
            username : userMessage.username,
            text : userMessage.text
        })
        await newChat.save();
    
        // Broadcast userMessage object to all clients--
        socket.broadcast.emit('broadcast-message', userMessage);
    })

    socket.on('typing' , (username)=>{
        // Broadcast typing message to all clients--
        socket.broadcast.emit('typing-message',{ text: `@${username} is typing...` } );
    })
    socket.on('not-typing' , (username)=>{
        // Broadcast typing message to all clients--
        socket.broadcast.emit('not-typing-message');
    })

    // Disconnect-->> 
    socket.on('disconnect' ,async ()=>{
        await UserModel.findByIdAndDelete(socket.userId).then(()=>{
            socket.broadcast.emit("user-left", {
                text: `${socket.username} has left the room.`,
                username : socket.username
            });
            
            // socket.broadcast.emit("user-deleted" , socket.userId);
        })

        await UserModel.find().then(users=>{
            // Emitting 'add-users' event to client--
            socket.broadcast.emit('add-users', users);
          }).catch(err=>{
             console.log(err);
       });
        console.log('Disconnected');
    })
});


