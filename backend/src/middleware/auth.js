const env = require('../config/env');
const { verifyAccessToken } = require('../services/token.service');

function getTokenFromRequest(req) {
  const cookieToken = req.cookies ? req.cookies[env.cookieName] : null;
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

function requireAuth(req, res, next) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ message: 'Neautorizované' });
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
      playerCategory: payload.playerCategory || null
    };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Neautorizované' });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Neautorizované' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Nemáte oprávnenie na túto akciu' });
    }

    return next();
  };
}

module.exports = {
  requireAuth,
  requireRole
};