// ════════════════════════════════════════════════
//  GrabReel – server.js  (Entry Point)
// ════════════════════════════════════════════════
'use strict';

require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');

const { limiter }        = require('./middleware/rateLimiter');
const { errorHandler }   = require('./middleware/errorHandler');
const { requestLogger }  = require('./middleware/requestLogger');
const downloadRouter     = require('./routes/download');
const healthRouter       = require('./routes/health');

// ── App ──────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 5000;

// ── Security headers ─────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGIN || '*').split(',');
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, Postman, mobile apps)
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    cb(new Error(`CORS: origin "${origin}" not allowed`));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// ── Body parsing ─────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

// ── HTTP logging (dev only) ───────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ── Custom request logger ────────────────────────
app.use(requestLogger);

// ── Global rate limiter ──────────────────────────
app.use('/api/', limiter);

// ── Routes ───────────────────────────────────────
app.use('/api/health',   healthRouter);
app.use('/api/download', downloadRouter);

// ── 404 handler ──────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error:   'Route not found',
    path:    req.originalUrl,
  });
});

// ── Global error handler ─────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 GrabReel API running on http://localhost:${PORT}`);
  console.log(`   ENV  : ${process.env.NODE_ENV}`);
  console.log(`   CORS : ${process.env.ALLOWED_ORIGIN || '*'}\n`);
});

module.exports = app;
