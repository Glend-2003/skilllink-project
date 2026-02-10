const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const morgan = require('morgan');
require('dotenv').config();

// Helper function to rewrite body for proxied requests
const fixRequestBody = (proxyReq, req) => {
    if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
    }
};

const app = express();
const PORT = process.env.PORT || 3000;

// CORS and logging first (safe for proxying)
app.use(cors());
app.use(morgan('dev'));

// Test route
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth Service FIRST - before ANY other routes  
// Express strips /api/v1/auth, leaving /login
// We need to prepend /api/Auth to get /api/Auth/login
app.use('/api/v1/auth', (req, res, next) => {
    req.url = `/api/Auth${req.url}`;
    next();
}, createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL || 'http://auth-service:8080',
    changeOrigin: true,
    onError: (err, req, res) => {
        console.error(`[Auth Error] ${err.message}`);
        res.status(500).json({ error: 'Auth service error', message: err.message });
    }
}));

// Provider Profile - MUST BE BEFORE provider-request (more specific route)
app.use('/api/v1/provider/profile', createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL || 'http://auth-service:8080',
    changeOrigin: true,
    pathRewrite: function(path, req) {
        const newPath = '/api/Provider/profile' + req.url;
        return newPath;
    },
    onError: (err, req, res) => {
        console.error(`[Provider Profile Error] ${err.message}`);
        res.status(500).json({ error: 'Provider profile error', message: err.message });
    }
}));

// Provider Request (singular) - Create request (MUST BE BEFORE provider-requests plural)
app.use('/api/v1/provider-request', createProxyMiddleware({
    target: process.env.PROVIDER_SERVICE_URL || 'http://provider-service:3000',
    changeOrigin: true,
    pathRewrite: {
        '^/': '/api/provider-request'
    },
    onError: (err, req, res) => {
        console.error(`[Provider Request Error] ${err.message}`);
        res.status(500).json({ error: 'Provider request error', message: err.message });
    }
}));

// Provider Requests (plural) - Admin endpoints (MUST BE EARLY - before generic /api/v1 catchall)
app.use('/api/v1/provider-requests', createProxyMiddleware({
    target: process.env.PROVIDER_SERVICE_URL || 'http://provider-service:3000',
    changeOrigin: true,
    pathRewrite: function(path, req) {
        const newPath = '/api/provider-requests' + req.url;
        return newPath;
    },
    onError: (err, req, res) => {
        console.error(`[Provider Requests Error] ${err.message}`);
        res.status(500).json({ error: 'Provider requests error', message: err.message });
    }
}));

// 2. User Service (NestJS)
app.use('/api/v1/users', createProxyMiddleware({
    target: process.env.USER_SERVICE_URL || 'http://user-service:3001',
    changeOrigin: true,
    pathRewrite: {
        '^/api/v1/users': '/users'
    }
}));

app.use('/api/v1/user-profile', (req, res, next) => {
    req.url = `/user-profile${req.url}`;
    next();
}, createProxyMiddleware({
    target: process.env.USER_SERVICE_URL || 'http://user-service:3001',
    changeOrigin: true,
    timeout: 30000,
    proxyTimeout: 30000,
    onError: (err, req, res) => {
        console.error(`[User Profile Error] ${err.message}`);
        res.status(500).json({ error: 'User Profile service error', message: err.message });
    }
}));

// 3. Chat Service (MUST BE BEFORE Service Manager)
app.use('/api/v1/chat', (req, res, next) => {
    // Manually rewrite the path to add /api prefix
    req.url = `/api${req.url}`;
    next();
}, createProxyMiddleware({
    target: process.env.CHAT_SERVICE_URL || 'http://chat-service:3000',
    changeOrigin: true,
    ws: true,
    onError: (err, req, res) => {
        console.error(`[Chat Service Error] ${err.message}`);
        res.status(500).send('Chat service proxy error');
    }
}));

// 4. Reviews Service - REMOVED (handled by Service Manager)
// Reviews are now managed by Service Manager at /api/v1/reviews/*

// 5. Payment Service (Java Spring Boot)
app.use('/api/v1/payments', createProxyMiddleware({
    target: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:8081',
    changeOrigin: true
}));

// 6. Notification Service (Node.js/Express)
app.use('/api/v1/notifications', createProxyMiddleware({
    target: process.env.NOTIFICATION_SERVICE_URL || 'http://notification_service:3006',
    changeOrigin: true,
    pathRewrite: {
        '^/api/v1/notifications': '/api/notifications'
    }
}));

// 7. Provider Service (Node.js/Express)
// 7.1 Providers (general route)
// Express strips /api/v1/providers, we need to add /api/providers prefix
app.use('/api/v1/providers', (req, res, next) => {
    req.url = `/api/providers${req.url}`;
    next();
}, createProxyMiddleware({
    target: process.env.PROVIDER_SERVICE_URL || 'http://provider-service:3000',
    changeOrigin: true,
    onError: (err, req, res) => {
        console.error(`[Provider Service Error] ${err.message}`);
        res.status(500).json({ error: 'Provider service error', message: err.message });
    }
}));

// 8. Service Manager (LAST - catches all remaining /api/v1/* routes)
app.use('/api/v1', createProxyMiddleware({
    target: process.env.SERVICE_MANAGER_URL || 'http://service-manager:3000',
    changeOrigin: true,
    pathRewrite: {
        '^/api/v1': ''
    },
    onError: (err, req, res) => {
        console.error(`[Service Manager Error] ${err.message}`);
        res.status(500).send('Service manager proxy error');
    }
}));

app.get('/', (req, res) => {
    res.send('API Gateway SkillLink is running correctly!');
});

app.use((req, res, next) => {
    res.status(404).json({ error: 'Not found', path: req.url });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`API Gateway running on port ${PORT}`);
});