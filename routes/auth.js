// routes/auth.js
import express from 'express'
import jwt from 'jsonwebtoken'
import db from '../db.js'

const router = express.Router()
const SECRET = 'bookverse_secret'

// Register a new user
router.post('/register', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password)
    return res.status(400).json({ message: 'Username and password required' })

  const existing = db.data.users.find(u => u.username === username)
  if (existing) return res.status(409).json({ message: 'User already exists' })

  db.data.users.push({ username, password })
  await db.write()
  res.json({ message: 'Registration successful' })
})

// Login and get JWT token
router.post('/login', (req, res) => {
  const { username, password } = req.body
  const user = db.data.users.find(
    u => u.username === username && u.password === password
  )
  if (!user) return res.status(401).json({ message: 'Invalid credentials' })

  const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' })
  res.json({ message: 'Login successful', token })
})

export default router
