const socket = io();

const chatForm = document.getElementById('chat-form')
const chatMessage = document.querySelector('.chat-messages')


//get username from url param
const {username}= Qs.parse(location.search, {
    ignoreQueryPrefix: true
})


socket.on('message', messageFromServer => {
    //listen for server chatmessage emit
    outPutMessage(messageFromServer)
   
    //scroll effect
    chatMessage.scrollTop = chatMessage.scrollHeight
})

chatForm.addEventListener('submit', (e)=>{
    e.preventDefault()

    //get chatmessage from user
    const chatMessage= e.target.elements.msg.value
   
    //emit message to server
    socket.emit('message', {chatMessage, username, id: socket.id})

    e.target.elements.msg.value = '';
    e.target.elements.msg.value.focus;
    
})

function outPutMessage(messageFromServer) {
   const div = document.createElement('div');
   div.classList.add('message');

   div.innerHTML =`<p class="meta">${messageFromServer.user}<span>${messageFromServer.time}</span></p>
   <p class="text"> ${messageFromServer.text} </p>`

   document.querySelector('.chat-messages').appendChild(div)

}