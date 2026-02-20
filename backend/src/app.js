const crypto = require('crypto');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const env = require('./config/env');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const trainingsRoutes = require('./routes/trainings.routes');
const announcementsRoutes = require('./routes/announcements.routes');
const pollsRoutes = require('./routes/polls.routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (env.frontendOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('CORS: origin not allowed'));
    },
    credentials: true
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get('/api/csrf-token', (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie('osk_csrf', token, {
    httpOnly: false,
    secure: env.cookieSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: 1000 * 60 * 60
  });
  return res.json({ csrfToken: token });
});

app.use((req, res, next) => {
  if (!env.csrfProtection) return next();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const cookieToken = req.cookies ? req.cookies.osk_csrf : null;
    const headerToken = req.headers['x-csrf-token'];
    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      return res.status(403).json({ message: 'CSRF kontrola zlyhala' });
    }
  }
  return next();
});

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/trainings', trainingsRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/polls', pollsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;