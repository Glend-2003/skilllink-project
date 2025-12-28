const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad y logs
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

// --- CONFIGURACIÓN DE RUTAS (PROXIES) ---

// Redirigir todo lo que vaya a /api/v1/auth hacia el servicio .NET (Puerto 5001)
app.use('/api/v1/auth', createProxyMiddleware({
    target: 'http://localhost:5001', 
    changeOrigin: true,
    pathRewrite: {
        '^/api/v1/auth': '/api/auth', 
    },
}));

// Redirigir a User-Service (Node.js en puerto 3002)
app.use('/api/v1/users', createProxyMiddleware({
    target: 'http://localhost:3002',
    changeOrigin: true,
}));

// Redirigir al Review Service (Python en puerto 8000)
app.use('/api/v1/reviews', createProxyMiddleware({
    target: 'http://localhost:8000',
    changeOrigin: true,
    pathRewrite: {
        '^/api/v1/reviews': '/', 
    },
}));

// Redirigir al User Service (Gestión de perfiles - Puerto 3004)
app.use('/api/v1/users', createProxyMiddleware({
    target: 'http://localhost:3004',
    changeOrigin: true,
}));

app.get('/health', (req, res) => {
    res.json({ status: 'API Gateway is running' });
});

app.listen(PORT, () => {
    console.log(`🚀 API Gateway SkillLink corriendo en http://localhost:${PORT}`);
});