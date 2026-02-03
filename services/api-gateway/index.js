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

// Service-Manager (Node + Express) - Puerto 3002
app.use('/api/v1', createProxyMiddleware({
    target: 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: (path, req) => {

        console.log(`[Gateway] Recibido: ${path}`);
        return path.replace('/api/v1', ''); 
    },
    onProxyReq: (proxyReq, req) => {
        console.log(`[Gateway] Redirigiendo a Service-Manager: ${req.method} ${proxyReq.path}`);
    },
    onError: (err) => {
        console.error('[Gateway Error]', err.message);
    }
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

app.listen(3000, () => console.log('🚀 API Gateway on port 3000'));