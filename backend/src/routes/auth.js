const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { JWT_SECRET } = require('../config');

const router = express.Router();

const registerValidators = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const loginValidators = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const getUserByUsername = db.prepare(
  'SELECT id, username, password_hash FROM users WHERE username = ?'
);
const insertUser = db.prepare(
  'INSERT INTO users (username, password_hash) VALUES (?, ?)'
);

router.post('/register', registerValidators, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const username = req.body.username.trim();
  const password = req.body.password;

  try {
    const existing = getUserByUsername.get(username);
    if (existing) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const result = insertUser.run(username, passwordHash);
    const userId = Number(result.lastInsertRowid);
    const token = jwt.sign({ id: userId, username }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.status(201).json({
      token,
      user: { id: userId, username },
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/login', loginValidators, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const username = req.body.username.trim();
  const password = req.body.password;

  try {
    const user = getUserByUsername.get(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const matches = bcrypt.compareSync(password, user.password_hash);
    if (!matches) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.json({ token, user: { id: user.id, username: user.username } });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
