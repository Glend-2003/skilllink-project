const io = require('socket.io-client');

const socket = io('http://localhost:3003');

socket.on('connect', () => {
  console.log('Script: Conectado al servidor de chat');
  socket.emit('join_chat', { conversationId: '4', userId: 9 }); 
});

socket.on('receive_message', (data) => {
  console.log(`Mensaje recibido de ${data.senderId}: ${data.content}`);
});

socket.on('disconnect', () => {
  console.log('Desconectado del servidor');
});


function sendMessage(content) {
  const messageData = {
    requestId: '4',
    senderId: 9, 
    content: content,
  };
  socket.emit('send_message', messageData);
  console.log(`Mensaje enviado: ${content}`);
}

socket.on('connect', () => {
  console.log('Script: Conectado');
  setTimeout(() => {
    sendMessage('Mensaje de prueba manual');
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

console.log('Escribe mensajes y presiona Enter para enviar. Ctrl+C para salir.');