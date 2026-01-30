const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Basic configurations 
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));

// 1. Auth Service
// In Docker it will use: http://auth-service:8080
const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001'; 
app.use('/api/v1/auth', createProxyMiddleware({
    target: process.env.AUTH_URL || 'http://auth-service:8080',
    changeOrigin: true,
    pathRewrite: {
        '^/': '/api/auth/'
    },
    onProxyReq: (proxyReq, req, res) => {
   
        console.log(`[Gateway] Redirecting Auth to: ${AUTH_URL}${req.url}`);
    }
}));

// 2. User Service
const USER_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
app.use('/api/v1/users', createProxyMiddleware({
    target: process.env.USER_SERVICE_URL || 'http://user-service:3001',
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[Gateway] Redirecting Users to: ${USER_URL}${req.url}`);
    }
}));

// 3. Service Manager (Categories, Services, etc.)
const MANAGER_URL = process.env.SERVICE_MANAGER_URL || 'http://localhost:3002';
app.use('/api/v1/services', createProxyMiddleware({
    target: MANAGER_URL,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[Gateway] Redirecting Manager to: ${MANAGER_URL}${req.url}`);
    }
}));

// 4. Provider Service
const PROVIDER_URL = process.env.PROVIDER_SERVICE_URL || 'http://localhost:3003';
app.use('/api/v1/users', createProxyMiddleware({
    target: process.env.USER_SERVICE_URL || 'http://user-service:3000', 
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
        console.log(`[Gateway] Redirecting Chat to: ${CHAT_URL}${req.url}`);
    }
}));

// 6. Payment Service
const PAYMENT_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:8081';
app.use('/api/v1/payments', createProxyMiddleware({
    target: PAYMENT_URL,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[Gateway] Redirecting Payment to: ${PAYMENT_URL}${req.url}`);
    }
}));

// base route to verify API Gateway is running
app.get('/', (req, res) => {
    res.send('API Gateway SkillLink is running correctly! 🚀');
});

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});