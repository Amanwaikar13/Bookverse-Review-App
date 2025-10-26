const express = require('express');
const router = express.Router();
const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../db');
const { SECRET } = require('../middleware/auth');

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  usernameOrEmail: Joi.string().required(),
  password: Joi.string().required()
});

// register
router.post('/register', async (req, res) => {
  await db.read();
  const { error, value } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  const { username, email, password } = value;
  const exists = db.data.users.find(u => u.username === username || u.email === email);
  if (exists) return res.status(409).json({ error: 'User already exists' });

  const hash = await bcrypt.hash(password, 10);
  const newUser = {
    id: `u_${Date.now()}`,
    username,
    email,
    passwordHash: hash,
    createdAt: new Date().toISOString()
  };
  db.data.users.push(newUser);
  await db.write();
  res.status(201).json({ message: 'Registered' });
});

// login -> returns JWT and sets session
router.post('/login', async (req, res) => {
  await db.read();
  const { error, value } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  const { usernameOrEmail, password } = value;
  const user = db.data.users.find(
    u => u.username === usernameOrEmail || u.email === usernameOrEmail
  );
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  // create JWT
  const token = jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    SECRET,
    { expiresIn: '1h' }
  );

  // create session
  req.session.user = { id: user.id, username: user.username, email: user.email };

  res.json({ message: 'Logged in', token });
});

// logout (clears session)
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Could not logout' });
    res.json({ message: 'Logged out' });
  });
});

module.exports = router;
