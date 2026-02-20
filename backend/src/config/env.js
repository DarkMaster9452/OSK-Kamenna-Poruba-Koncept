const dotenv = require('dotenv');

dotenv.config({ override: true });

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  frontendOrigins: (process.env.FRONTEND_ORIGIN || 'http://127.0.0.1:5500,http://localhost:5500,http://127.0.0.1:5501,http://localhost:5501')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'dev_only_change_me',
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
  cookieName: process.env.COOKIE_NAME || 'osk_session',
  cookieSecure: String(process.env.COOKIE_SECURE || 'false') === 'true',
  csrfProtection: String(process.env.CSRF_PROTECTION || 'true') === 'true'
};

if (env.nodeEnv === 'production' && env.jwtAccessSecret === 'dev_only_change_me') {
  throw new Error('JWT_ACCESS_SECRET must be set in production');
}

module.exports = env;