const PORT = process.env.PORT || 3000
const express = require('express')
const app = express()

const httpServer = require('http').createServer(app)
const io = require('socket.io')(httpServer)

app.use(express.static(__dirname + '/src'))

const users = {}
const roomMessages = {}

const appendRoomMessage = (key, message) => {
  roomMessages[key] = Object.keys(roomMessages).includes(key)
    ? [...roomMessages[key], message]
    : [message]
}


io.on('connection', socket => {

  socket.emit('chat-message', {
    data: {
      message: 'Welcome to chat',
      name: 'server'
    },
    key: 'server'
  })
  
  socket.on('new-user', name => {
    users[socket.id] = name
    socket.emit('user-connected', {
      users: users,
      name: name,
      messages: Object.keys(roomMessages).includes('server') ? roomMessages['server'] : []
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
  
  socket.on('send-chat-message', ({message, key}) => {
    const chatMessage = {
      message: message,
      name: users[socket.id]
    }

    appendRoomMessage(key, chatMessage)
    socket.broadcast.emit('chat-message', {
      data: chatMessage,
      key: key
    }) // to every other client but not to the one who send
  })

  socket.on('switch-room', ({key}) => {
    const messages = Object.keys(roomMessages).includes(key) 
      ? roomMessages[key]
      : []
    socket.emit('room-conversation', messages)
  })
})

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
