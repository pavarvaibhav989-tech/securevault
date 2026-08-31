require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db');
const { PORT, CLIENT_URL } = require('./config/config');
const { apiLimiter } = require('./middleware/rateLimiter');
const idsMiddleware = require('./middleware/idsMiddleware');
const setupSocket = require('./socket/socketHandler');

// Route imports
const authRoutes = require('./routes/auth');
const encryptionRoutes = require('./routes/encryption');
const hashRoutes = require('./routes/hash');
const rsaRoutes = require('./routes/rsa');
const firewallRoutes = require('./routes/firewall');
const idsRoutes = require('./routes/ids');
const dashboardRoutes = require('./routes/dashboard');
const chatRoutes = require('./routes/chat');

// Init Express
const app = express();
const server = http.createServer(app);

// Trust Render/Vercel/Railway reverse proxy
// Required for express-rate-limit to correctly read client IP from X-Forwarded-For
app.set('trust proxy', 1);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
setupSocket(io);
app.set('io', io); // Make io available in controllers via req.app.get('io')

// ─────────────────────────────────────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Global rate limiter
app.use('/api', apiLimiter);

// Passive IDS – inspect all API requests
app.use('/api', idsMiddleware);

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// ─────────────────────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/encryption', encryptionRoutes);
app.use('/api/hash', hashRoutes);
app.use('/api/rsa', rsaRoutes);
app.use('/api/firewall', firewallRoutes);
app.use('/api/ids', idsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chat', chatRoutes);

// CAPTCHA route
const { generateTextCaptcha, generateMathCaptcha } = require('./utils/captcha/captchaGenerator');
app.get('/api/captcha/text', (req, res) => {
  const captcha = generateTextCaptcha();
  res.json({ success: true, data: { text: captcha.text } });
});
app.get('/api/captcha/math', (req, res) => {
  const captcha = generateMathCaptcha();
  res.json({ success: true, data: { question: captcha.question, answer: captcha.answer } });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🔐 SecureVault API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error.' : err.message,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────────────────────────────────────
const start = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`\n🚀 SecureVault Server running on port ${PORT}`);
    console.log(`   API:    http://localhost:${PORT}/api`);
    console.log(`   Health: http://localhost:${PORT}/api/health\n`);
  });
};

start();
