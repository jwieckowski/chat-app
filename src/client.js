const socket = io('http://localhost:3000')
const userContainer = document.getElementById('users-container')
const messageContainer = document.getElementById('messages-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')

let currentReceiver = 'server'
let currentConversation = []
let activeUsers = []

const newUser = prompt('What is your name?')
appendUser('server')
appendUser('You')
socket.emit('new-user', newUser)

socket.on('chat-message', ({data, key}) => {
    if (key === getActiveKey(currentReceiver) || data.name === 'server') {
        appendMessage(data)
    }
})

socket.on('user-connected', data => {
    const newUsers = Object.values(data.users).filter(name => name !== newUser && !activeUsers.includes(name))
    newUsers.map(name => {
        appendUser(name)
        activeUsers.push(name)
    })

    checkActiveUsers()

    data.messages && data.messages.map(m => {
        appendMessage(m)
    })
})

socket.on('user-disconnected', name => {
    const user = document.getElementById(name)
    user.getElementsByTagName('span')[0].classList.remove('active')
    user.getElementsByTagName('span')[0].classList.add('inactive')
    
    setTimeout(() => {
        user.parentNode.removeChild(user)
        activeUsers = activeUsers.filter(user => user !== name)
        checkActiveUsers()
    }, 5000)
})

socket.on('room-conversation', messages => {
    currentConversation = messages
    messageContainer.innerHTML = ''
    currentConversation.map(m => {
        m.name = m.name === newUser
          ? 'You'
          : m.name
        appendMessage(m)
    })
})

messageForm.addEventListener('submit', e => {
    e.preventDefault()
    const message = messageInput.value
    if (message === '') return 
    appendMessage({ name: 'You', message: message})
    socket.emit('send-chat-message', {
        message: message,
        key: getActiveKey(currentReceiver)
    })
    messageInput.value = ''
})

function appendMessage (data) {
    const messageElement = document.createElement('div')
    messageElement.classList.add('message')

    data.name.toLowerCase().includes('server') && messageElement.classList.add('server-message')
    data.name.toLowerCase().includes('you') && messageElement.classList.add('sender-message')
    !data.name.toLowerCase().includes('server') &&
    !data.name.toLowerCase().includes('you') &&
    messageElement.classList.add('receiver-message')

    messageElement.innerText = `${data.name}: ${data.message}`
    messageContainer.append(messageElement)
    messageContainer.scrollTop = messageContainer.scrollHeight
}

function appendUser (user) {
    const userElement = document.createElement('div')
    
    const dot = document.createElement('span')
    dot.classList.add('dot')
    dot.classList.add('active')
    userElement.append(dot)
    
    userElement.setAttribute('id', user)
    userElement.classList.add('user')
    userElement.innerHTML += ` ${user}`

    userElement.addEventListener('click', (e) => {
        e.preventDefault()

        if (user === 'You') return

        // if (userElement.classList.contains('user-message')) userElement.classList.remove('user-message')

        currentReceiver = user
        socket.emit('switch-room', {key: getActiveKey(user)})
    })
    
    userContainer.append(userElement)
}

function checkActiveUsers () {
    const server = document.getElementById('server')
    if (activeUsers.length !== 0) {
        server.classList.remove('inactive')
        server.classList.add('active')
    } else {
        server.classList.remove('active')
        server.classList.add('inactive')
    }
}

function getActiveKey (user) {
    const mixed = [user, newUser].sort().join()
    return currentReceiver === 'server' ? 'server' : mixed
}