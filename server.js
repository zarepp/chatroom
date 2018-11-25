const express = require('express');
const mongo = require('mongodb').MongoClient;
const socketio = require('socket.io');
const app = express();

const server = app.listen(8000, () => {
  console.log("The server is listerning on the port 8000 ..");
})

const io = socketio(server);

mongo.connect('mongodb+srv://Zharif:1q2w3e4rMz@clusterzer0-pthxk.mongodb.net/chatroom', function(err, db) {
  if (err) {
    throw err;
  }
  // console.log('Mongodb connected ..');
  // Connect to Socket.io
  io.on('connection', function(socket) {
    let chat = db.db('chatroom').collection('chats');

    sendStatus = function(s) {
      socket.emit('status', s);
    }

    chat.find().limit(100).sort({ _id: 1 }).toArray(function(err,res) {
      if (err) {
        throw err;
      }

      // Emit the messages
      socket.emit('output', res);
    });

    // Handle input events
    socket.on('input', function(data) {
      let name = data.name;
      let message = data.message;

      // Check for name and message
      if (name === '' || message == '') {
        sendStatus('Please enter name and status');
      } else {
        chat.insert({
          name: name,
          message: message
        }, function() {
          io.emit('output', [data]);

          sendStatus({
            message: 'Message sent',
            clear: true
          })
        })
      }
    })

    // Handle clear
    socket.on('clear', function(data) {
      chat.remove({}, function() {
        socket.emit('cleared');
      });
    });
  });
});

app.use(express.static('public'));