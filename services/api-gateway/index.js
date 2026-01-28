const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();

app.use(cors());

// Auth (.NET) - Puerto 5293
app.use('/api/v1/auth', createProxyMiddleware({
    target: 'http://localhost:5293/api/auth',
    changeOrigin: true,
    pathRewrite: { '^/api/v1/auth': '' }
}));

// Services (NestJS) - Puerto 3002
app.use('/api/v1/services', createProxyMiddleware({
    target: 'http://localhost:3002',
    changeOrigin: true
}));


// providers.controller.ts -> @Controller('providers')
app.use('/api/v1/providers', createProxyMiddleware({
    target: 'http://localhost:3002/providers',
    changeOrigin: true,
    pathRewrite: { '^/api/v1/providers': '' }
}));

// categories.controller.ts -> @Controller('categories')
app.use('/api/v1/categories', createProxyMiddleware({
    target: 'http://localhost:3002/categories',
    changeOrigin: true,
    pathRewrite: { '^/api/v1/categories': '' }
}));

// gallery.controller.ts -> @Controller('gallery')
app.use('/api/v1/gallery', createProxyMiddleware({
    target: 'http://localhost:3002/gallery',
    changeOrigin: true,
    pathRewrite: { '^/api/v1/gallery': '' }
}));

// Chat (Node + WebSocket) - Puerto 3003
app.use('/api/v1/chat', createProxyMiddleware({
    target: 'http://localhost:3003',
    changeOrigin: true,
    ws: true
}));

// Reviews (Python) - Puerto 8000
app.use('/api/v1/reviews', createProxyMiddleware({
    target: 'http://localhost:8000',
    changeOrigin: true,
    pathRewrite: { '^/api/v1/reviews': '/' }
}));

// Profiles (NestJS) - Puerto 3004
app.use('/api/v1/users', createProxyMiddleware({
    target: 'http://localhost:3004',
    changeOrigin: true
}));

// Payment-Service (Spring Boot - Java) - 3005
app.use('/api/v1/payments', createProxyMiddleware({
    target: 'http://localhost:3005',
    changeOrigin: true,
    pathRewrite: { '^/api/v1/payments': '/api/payments' }
}));

app.listen(3000, () => console.log('🚀 API Gateway on port 3000'));