const PORT = process.env.PORT || 3000
const express = require('express')
const app = express()

const httpServer = require('http').createServer(app)
const io = require('socket.io')(httpServer)

app.use(express.static(__dirname + '/src'))

const users = {}

io.on('connection', socket => {

  socket.emit('chat-message', 
  {
    message: 'Welcome to chat',
    name: 'Server'
  })
  
  socket.on('new-user', name => {
    users[socket.id] = name
    // socket.broadcast.emit('user-connected', name) // to all users 
    socket.emit('user-connected', {
      users: users,
      name: name
    })
    socket.broadcast.emit('user-connected', {
      users: users,
      name: name
    })
  })
  
  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', users[socket.id]) // to all users 
    delete users[socket.id]
  })
  
  socket.on('send-chat-message', message => {
    socket.broadcast.emit('chat-message',
    {
      message: message,
      name: users[socket.id]
    }) // to every other client but not to the one who send
  })
})

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
