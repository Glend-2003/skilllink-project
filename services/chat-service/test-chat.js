const io = require('socket.io-client');

const socket = io('http://localhost:3003');

socket.on('connect', () => {
  console.log('Script: Conectado al servidor de chat');
  socket.emit('join_chat', '4'); // Usar conversation_id directamente
});

socket.on('receive_message', (data) => {
  console.log(`Mensaje recibido de ${data.senderId}: ${data.content}`);
});

socket.on('disconnect', () => {
  console.log('Desconectado del servidor');
});

// Función para enviar mensajes
function sendMessage(content) {
  const messageData = {
    requestId: '4', // conversation_id
    senderId: 9, // user ID numérico
    content: content,
  };
  socket.emit('send_message', messageData);
  console.log(`Mensaje enviado: ${content}`);
}

// Ejemplo: enviar un mensaje inmediatamente
socket.on('connect', () => {
  console.log('Script: Conectado');
  setTimeout(() => {
    sendMessage('Mensaje de prueba manual');
  }, 1000);
});

// Para enviar manualmente, puedes llamar sendMessage('tu mensaje') en la consola de Node
// O modificar el script para leer de stdin

// Para leer de consola:
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (input) => {
  sendMessage(input);
});

console.log('Escribe mensajes y presiona Enter para enviar. Ctrl+C para salir.');