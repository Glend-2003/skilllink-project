const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const morgan = require('morgan'); // Agregamos el logger que te comenté
require('dotenv').config();

const app = express();

// Configuración básica
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev')); // Logger para ver las peticiones en la consola

// 1. Auth Service
// En Docker usará: http://auth-service:8080
const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001'; 
app.use('/api/v1/auth', createProxyMiddleware({
    target: process.env.AUTH_URL || 'http://auth-service:8080',
    changeOrigin: true,
    pathRewrite: {
        '^/': '/api/auth/'
    },
    onProxyReq: (proxyReq, req, res) => {
   
        console.log(`[Gateway] Redirigiendo Auth a: ${AUTH_URL}${req.url}`);
    }
}));

// 2. User Service
const USER_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
app.use('/api/v1/users', createProxyMiddleware({
    target: process.env.USER_SERVICE_URL || 'http://user-service:3001',
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[Gateway] Redirigiendo Users a: ${USER_URL}${req.url}`);
    }
}));

// 3. Service Manager (Categorías, Servicios, etc.)
const MANAGER_URL = process.env.SERVICE_MANAGER_URL || 'http://localhost:3002';
app.use('/api/v1/services', createProxyMiddleware({
    target: MANAGER_URL,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[Gateway] Redirigiendo Manager a: ${MANAGER_URL}${req.url}`);
    }
}));

// 4. Provider Service
const PROVIDER_URL = process.env.PROVIDER_SERVICE_URL || 'http://localhost:3003';
app.use('/api/v1/users', createProxyMiddleware({
    target: process.env.USER_SERVICE_URL || 'http://user-service:3000', // Verifica el puerto
    changeOrigin: true,
    pathRewrite: {
        '^/api/v1/users': '/users' 
    }
}));

// 5. Chat Service
const CHAT_URL = process.env.CHAT_SERVICE_URL || 'http://localhost:3004';
app.use('/api/v1/chat', createProxyMiddleware({
    target: CHAT_URL,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[Gateway] Redirigiendo Chat a: ${CHAT_URL}${req.url}`);
    }
}));

// 6. Payment Service
const PAYMENT_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:8081';
app.use('/api/v1/payments', createProxyMiddleware({
    target: PAYMENT_URL,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[Gateway] Redirigiendo Payment a: ${PAYMENT_URL}${req.url}`);
    }
}));

// Ruta base para verificar que el Gateway está vivo
app.get('/', (req, res) => {
    res.send('API Gateway SkillLink is running correctly! 🚀');
});

app.listen(PORT, () => {
    console.log(`API Gateway corriendo en el puerto ${PORT}`);
});