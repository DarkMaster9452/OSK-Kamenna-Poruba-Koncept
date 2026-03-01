const crypto = require('crypto');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const env = require('./config/env');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const trainingsRoutes = require('./routes/trainings.routes');
const announcementsRoutes = require('./routes/announcements.routes');
const blogRoutes = require('./routes/blog.routes');
const pollsRoutes = require('./routes/polls.routes');
const usersRoutes = require('./routes/users.routes');
const playersRoutes = require('./routes/players.routes');
const sportsnetRoutes = require('./routes/sportsnet.routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

const trustProxyRaw = String(env.trustProxy || 'false').trim().toLowerCase();
if (trustProxyRaw === 'true') {
  app.set('trust proxy', true);
} else if (trustProxyRaw === 'false') {
  app.set('trust proxy', false);
} else {
  const parsedTrustProxy = Number(trustProxyRaw);
  app.set('trust proxy', Number.isNaN(parsedTrustProxy) ? trustProxyRaw : parsedTrustProxy);
}

function escapeForRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isOriginAllowed(origin, allowedOrigins) {
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  return allowedOrigins.some((allowed) => {
    if (!allowed.includes('*')) {
      return false;
    }

    const wildcardPattern = '^' + allowed.split('*').map(escapeForRegex).join('.*') + '$';
    return new RegExp(wildcardPattern).test(origin);
  });
}

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (isOriginAllowed(origin, env.frontendOrigins)) {
        return callback(null, true);
      }

      return callback(new Error('CORS: origin not allowed'));
    },
    credentials: true
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(csrf({ cookie: true }));

app.use(
  ['/api', '/'],
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get(['/api/csrf-token', '/csrf-token'], (req, res) => {
  try {
    res.json({ csrfToken: req.csrfToken() });
  } catch (err) {
    console.error('CSRF error:', err);
    res.status(500).json({ error: err.message });
  }
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

// csurf middleware už zabezpečuje CSRF ochranu
app.use(['/api/health', '/health'], healthRoutes);
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/trainings', '/trainings'], trainingsRoutes);
app.use(['/api/announcements', '/announcements'], announcementsRoutes);
app.use(['/api/blog', '/blog'], blogRoutes);
app.use(['/api/polls', '/polls'], pollsRoutes);
app.use(['/api/users', '/users'], usersRoutes);
app.use(['/api/players', '/players'], playersRoutes);
app.use(['/api/sportsnet', '/sportsnet'], sportsnetRoutes);

app.get('/', (req, res) => {
  return res.json({
    status: 'ok',
    message: 'Backend API beží',
    health: '/api/health'
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;