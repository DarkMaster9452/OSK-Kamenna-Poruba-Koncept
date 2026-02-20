const express = require('express');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const env = require('../config/env');
const { findUserByUsername, findUserById, updateUserPassword, createAuditLog } = require('../data/repository');
const { validateBody } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { signAccessToken } = require('../services/token.service');

const router = express.Router();

const loginSchema = z.object({
  username: z.string().min(3).max(100),
  password: z.string().min(6).max(200)
});

const changePasswordSchema = z.object({
  newPassword: z.string().min(8).max(200)
});

function cookieOptions() {
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: 1000 * 60 * 60 * 24
  };
}

router.post('/login', validateBody(loginSchema), async (req, res) => {
  const { username, password } = req.body;
  const user = await findUserByUsername(username);

  if (!user || !user.isActive) {
    return res.status(401).json({ message: 'Nesprávne prihlasovacie údaje' });
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    return res.status(401).json({ message: 'Nesprávne prihlasovacie údaje' });
  }

  const token = signAccessToken({
    sub: user.id,
    username: user.username,
    role: user.role,
    playerCategory: user.playerCategory || null
  });

  res.cookie(env.cookieName, token, cookieOptions());

  return res.json({
    message: 'Prihlásenie úspešné',
    user: {
      username: user.username,
      role: user.role,
      playerCategory: user.playerCategory || null
    }
  });
});

router.post('/logout', (req, res) => {
  res.clearCookie(env.cookieName, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: env.cookieSecure
  });
  return res.json({ message: 'Odhlásenie úspešné' });
});

router.post('/change-password', requireAuth, validateBody(changePasswordSchema), async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user || !user.isActive) {
    return res.status(401).json({ message: 'Neautorizované' });
  }

  if (user.lastPasswordChangeAt) {
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const elapsedMs = Date.now() - new Date(user.lastPasswordChangeAt).getTime();
    if (elapsedMs < oneWeekMs) {
      const remainingDays = Math.ceil((oneWeekMs - elapsedMs) / (24 * 60 * 60 * 1000));
      return res.status(429).json({
        message: `Heslo môžete zmeniť iba raz za týždeň. Skúste znova o ${remainingDays} dní.`
      });
    }
  }

  const sameAsCurrent = await bcrypt.compare(req.body.newPassword, user.passwordHash);
  if (sameAsCurrent) {
    return res.status(400).json({ message: 'Nové heslo musí byť odlišné od aktuálneho.' });
  }

  const newPasswordHash = await bcrypt.hash(req.body.newPassword, 12);
  await updateUserPassword(user.id, newPasswordHash);

  try {
    await createAuditLog({
      actorUserId: req.user.id,
      action: 'password_changed',
      entityType: 'auth',
      entityId: user.id,
      details: null
    });
  } catch (error) {
    console.error('Audit log write failed:', error);
  }

  return res.json({ message: 'Heslo bolo úspešne zmenené.' });
});

router.get('/me', requireAuth, (req, res) => {
  return res.json({
    user: {
      username: req.user.username,
      role: req.user.role,
      playerCategory: req.user.playerCategory || null
    }
  });
});

module.exports = router;