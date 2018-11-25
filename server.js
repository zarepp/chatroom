const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;

mongo.connect('mongodb+srv://Zharif:1q2w3e4rMz@clusterzer0-pthxk.mongodb.net/chatroom', function(err, db) {
  if (err) {
    throw err;
  }
  console.log('MongoDB connected ..');

  // Connect to Socket.io
  client.on('connection', function(socket) {
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
          client.emit('output', [data]);

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