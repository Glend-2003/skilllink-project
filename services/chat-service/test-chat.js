const io = require('socket.io-client');

const socket = io('http://localhost:3002');

socket.on('connect', () => {
  console.log('Script: Connecting to chat service...');
  socket.emit('join_chat', { conversationId: '4', userId: 9 }); 
});

socket.on('receive_message', (data) => {
  console.log(`Message received from ${data.senderId}: ${data.content}`);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});


function sendMessage(content) {
  const messageData = {
    requestId: '4',
    senderId: 9, 
    content: content,
  };
  socket.emit('send_message', messageData);
  console.log(`Message sent: ${content}`);
}

socket.on('connect', () => {
  console.log('Script: Connected to chat service.');
  setTimeout(() => {
    sendMessage('Manual test message');
  }, 1000);
});

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (input) => {
  sendMessage(input);
});

console.log('Type messages and press Enter to send. Ctrl+C to exit.');