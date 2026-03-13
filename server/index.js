require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const { testConnection } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorHandler = require('./middleware/errorHandler');
const { globalRateLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security Headers ─────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ── CORS ─────────────────────────────────────────────────────
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-simulated-ip'],
}));

// ── Body Parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── Logging ───────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ── IP Simulation (Development Only) ──────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-simulated-ip']) {
      req.headers['x-forwarded-for'] = req.headers['x-simulated-ip'];
      // Force rate limiter & controller to see this IP
      Object.defineProperty(req, 'ip', {
        configurable: true,
        get: () => req.headers['x-simulated-ip']
      });
    }
    next();
  });
}

// ── Global Rate Limiting ──────────────────────────────────────
app.use(globalRateLimiter);

// ── Health Check ──────────────────────────────────────────────
app.get('/health', async (req, res) => {
  const dbOk = await testConnection().catch(() => false);
  res.json({
    status: dbOk ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    services: { database: dbOk ? 'connected' : 'disconnected' },
  });
});

// ── Routes ────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

// ── 404 ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` });
});

// ── Error Handler ─────────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────
const startServer = async () => {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔒 JWT expires in: ${process.env.JWT_EXPIRES_IN}`);
  });
};

startServer();

module.exports = app;
