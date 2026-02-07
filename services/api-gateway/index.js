const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));

// 1. Auth Service (C#/.NET)
app.use(createProxyMiddleware({
    pathFilter: '/api/v1/auth',
    target: process.env.AUTH_SERVICE_URL || 'http://auth_service:8080',
    changeOrigin: true,
    pathRewrite: {
        '^/api/v1/auth': '/api/Auth'
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[Auth Proxy] Reenviando ${req.method} ${req.url} -> ${proxyReq.path}`);
    }
}));

// 2. User Service (NestJS)
app.use('/api/v1/users', createProxyMiddleware({
    target: process.env.USER_SERVICE_URL || 'http://user-service:3000',
    changeOrigin: true,
    pathRewrite: {
        '^/api/v1/users': '/users'
    }
}));

// 3. Service Manager (Reports, Settings, Services, Categories)
app.use('/api/v1', createProxyMiddleware({
    target: process.env.SERVICE_MANAGER_URL || 'http://service-manager:3000',
    changeOrigin: true,
    pathRewrite: (path, req) => {
        if (path.startsWith('/api/v1/auth') || path.startsWith('/api/v1/users') || path.startsWith('/api/v1/chat') || path.startsWith('/api/v1/reviews') || path.startsWith('/api/v1/payments')) {
            return path;
        }
        return path.replace('/api/v1', '');
    },
    onProxyReq: (proxyReq, req) => {
        console.log(`[Gateway] Proxying ${req.method} ${req.url} -> ${proxyReq.path}`);
    }
}));

// 4. Chat Service
app.use('/api/v1/chat', createProxyMiddleware({
    target: process.env.CHAT_SERVICE_URL || 'http://chat-service:3003',
    changeOrigin: true,
    ws: true
}));

// 5. Reviews Service (Python)
app.use('/api/v1/reviews', createProxyMiddleware({
    target: process.env.REVIEWS_SERVICE_URL || 'http://reviews-service:8000',
    changeOrigin: true,
    pathRewrite: { 
        '^/api/v1/reviews': '/' 
    }
}));

// 6. Payment Service
app.use('/api/v1/payments', createProxyMiddleware({
    target: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:8081',
    changeOrigin: true
}));

// Payment-Service (Spring Boot - Java) - 3005
app.use('/api/v1/payments', createProxyMiddleware({
    target: 'http://localhost:3005',
    changeOrigin: true,
    pathRewrite: { '^/api/v1/payments': '/api/payments' }
}));

app.get('/', (req, res) => {
    res.send('API Gateway SkillLink is running correctly!');
});

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
