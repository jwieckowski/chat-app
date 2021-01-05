const socket = io('http://localhost:3000')
const userContainer = document.getElementById('users-container')
const messageContainer = document.getElementById('messages-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')

let activeUsers = []
const newUser = prompt('What is your name?')
appendUser('You')
socket.emit('new-user', newUser)

socket.on('chat-message', data => {
    appendMessage(data)
})

socket.on('user-connected', data => {
    const newUsers = Object.values(data.users).filter(name => name !== newUser && !activeUsers.includes(name))
    newUsers.map(name => appendUser(name))
    activeUsers = newUsers
})

socket.on('user-disconnected', name => {
    const user = document.getElementById(name)
    user.getElementsByTagName('span')[0].classList.remove('active')
    user.getElementsByTagName('span')[0].classList.add('inactive')
    
    setTimeout(() => {
        user.parentNode.removeChild(user)
    }, 5000)
})

messageForm.addEventListener('submit', e => {
    e.preventDefault()
    const message = messageInput.value
    appendMessage({ name: 'You', message: message})
    socket.emit('send-chat-message', message)
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

    userContainer.append(userElement)
}