const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { initDB } = require('./db');
const requestLogger = require('./utils/requestLogger');
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');

const app = express();
const PORT = process.env.PORT || 3000;

(async () => {
  await initDB();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);
  app.use(morgan('tiny'));

  // session config (simple for lab environment)
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'lab-session-secret',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false, maxAge: 1000 * 60 * 60 } // 1 hour
    })
  );

  // rate limiter (unique touch)
  const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 80,
    message: { error: 'Too many requests - slow down' }
  });
  app.use(limiter);

  // mount routes
  app.use('/auth', authRoutes);
  app.use('/books', bookRoutes);

  // health
  app.get('/health', (req, res) => res.json({ ok: true }));

  // fallback error handler
  app.use((err, req, res, next) => {
    console.error('Unexpected error', err);
    res.status(500).json({ error: 'Internal error' });
  });

  app.listen(PORT, () => {
    console.log(`Book Review app running on http://localhost:${PORT}`);
  });
})();
