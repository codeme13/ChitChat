const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

const app = express();

const PORT = process.env.PORT || 3000;

 const m = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const io = socketio(m);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChitChat Bot';

// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to ChitChat!'));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room) 
      .emit(
        'message',
        formatMessage(botName, ` : ${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);
    socket.emit('message',formatMessage(user.username, msg,'right'));
    socket.broadcast.to(user.room).emit('message', formatMessage(user.username, msg,'left'));
    
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message', 
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

