const path = require('path')
const http = require('http')
const express = require('express');
// const session = require('express-session')
const socketio = require('socket.io');

const formatMessage = require('./public/utlis/messages')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

// configure session middleware
// const sessionMiddleware = session({
//     secret: "changeit",
//     resave: false,
//     saveUninitialized: false
// });

// app.use(sessionMiddleware);


//set public folder as static page
app.use(express.static((path.join(__dirname, 'public'))));
const PORT = 3000

// io.use((socket, next) => {
//     sessionMiddleware(socket.request, socket.request.res, next)
// })


//Run when client connects 
io.on('connection', (socket) => {
    console.log("New web-socket connected ...", socket.id)

    // get session ID from express-session middleware
    // const sessionId = socket.request.session.id;

    // store session ID as property of socket object
    // socket.sessionId = sessionId;

    // console.log(`User connected with session ID: ${sessionId}, ${socket.id}`);

   
    //welcome emit message 
    socket.emit('message', formatMessage('chatbot',
        `welcome to the MarketSquare ChatBot, how can i be of service to you today ?  
        <p> >> Select 1 to Place an Order </p>
        <p> >> Select 99 to checkout order </p>
        <p> >> Select 98 to see order history </p>
        <p> >> Select 97 to see current order </p>
        <p> >> Select 0 to cancel order </p>`));

   // Broadcast when user connects
    // socket.to(sessionId).emit('message', formatMessage(USER, 'A user just joined the chatroom', sessionId))


    // Store user's orders globally
    let orders = [];
    let orderHistory = [];

    //get chatmessage from client
    socket.on('message', messageFromClient => {

        //denature username and text contents from Client 
        let { chatMessage, username, id } = messageFromClient
      
        io.to(id).emit('message', formatMessage(username, chatMessage))
        // console.log(`This is the message from ${username}: socket ID ${id} and session ID ${sessionId},`)

        const items = ['Generator --#120,000', 'Speaker --#70,000', 'Blender --#15,000', 'Headset --#15,000', 'Cooker --#7,000'];
        //    let {chatMessage} = messageFromClient

        switch (chatMessage) {
            case "1":
                // Return a list of items from the restaurant
                io.to(id).emit('message', formatMessage('chatbot', 
                `Please select an item: <p> ${items.map((item, index) => `0${index + 1}. ${item}`).join('</p>')}`));
                break;


            case "99":
                if (orders.length > 0) {
                    // Place the order and clear the current order
                    io.to(id).emit('message',
                        formatMessage('chatbot', 'Order placed'));

                    orderHistory.push(orders)

                    orders = [];
                } else {
                    io.to(id).emit('message', formatMessage('chatbot',
                        `No order to place:
                        <p> >> Select 1 to Place an Order </p>
        `))
                }
                break;

            case "98":
                if (orderHistory.length > 0) {
                    io.to(id).emit('message', formatMessage('chatbot',
                        `Here is your order history:
           <p> ${orderHistory.map((order) => `${order}`).join('</p>')}
            `))
                } else {
                    io.to(id).emit('message', formatMessage('chatbot',
                        `You're yet to place any order:
            <p> >> Select 1 to Place an Order </p>`
                    ))
                }
                break;

            case "97":
                if (orders.length > 0) {
                    io.to(id).emit('message', formatMessage('chatbot',
                        `Here are your currently placed orders :
           <p> ${orders.map((order) => `${order}`).join('</p>')}
            `))
                } else {
                    io.to(id).emit('message', formatMessage('chatbot',
                        `Your cart is currently empty:
            <p> >> Select 1 to Place an Order </p>`
                    ))
                }
                break;

            case "0":
                if (orders.length > 0) {
                    orders = []
                    io.to(id).emit('message', formatMessage('chatbot', `your cart is now empty`
                    ))
                } else {
                    io.to(id).emit('message', formatMessage('chatbot',
                    `You don't have any current order:
                    <p> >> Select 1 to Place an Order </p>`
                ))
                }
                break;
            default:
                // pick fill order
                let index = parseInt(`0${chatMessage}`) - 1
              
                if (index >= 00 && index < items.length) {
                    let selectedItem = items[index]
                    orders.push(` ${selectedItem}`)


                    //return selected items to chat
                    io.to(id).emit('message', formatMessage("",
                        `order added :
           <p> ${orders.map((order, index) => `${index + 1}. ${order}`).join('</p>')}
           `
                    ))
                }

                if (index > items.length) {
                    io.to(id).emit('message', formatMessage("chatbot", 'Please enter a valid selection'))
                }

                break;
        }
    })

    //Broadcast when a user disconnects
    socket.on('disconnect', () => {
        console.log("User web-socket disconnected ...")

        // io.emit('message', formatMessage("USER", 'A user has just disconnected'))
    })

})

io.listen(5000);

server.listen(PORT, () => console.log(`server started on http://localhost:${PORT}`))