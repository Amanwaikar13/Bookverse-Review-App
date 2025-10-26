// routes/books.js
import express from 'express'
import jwt from 'jsonwebtoken'
import db from '../db.js'

const router = express.Router()
const SECRET = 'bookverse_secret'

// Middleware to verify JWT
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ message: 'Missing token' })
  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, SECRET)
    req.user = decoded
    next()
  } catch {
    res.status(403).json({ message: 'Invalid token' })
  }
}

// Get all books
router.get('/', (req, res) => {
  res.json(db.data.books)
})

// Get book by author
router.get('/author/:author', (req, res) => {
  const { author } = req.params
  const result = db.data.books.filter(
    b => b.author.toLowerCase() === author.toLowerCase()
  )
  res.json(result)
})

// Get book by title
router.get('/title/:title', (req, res) => {
  const { title } = req.params
  const result = db.data.books.filter(
    b => b.title.toLowerCase().includes(title.toLowerCase())
  )
  res.json(result)
})

// Get book by ISBN and review
router.get('/:isbn', (req, res) => {
  const book = db.data.books.find(b => b.isbn === req.params.isbn)
  if (!book) return res.status(404).json({ message: 'Book not found' })
  res.json(book)
})

// Add or modify review (authenticated)
router.put('/:isbn/review', authenticate, async (req, res) => {
  const { isbn } = req.params
  const { review } = req.body
  const book = db.data.books.find(b => b.isbn === isbn)
  if (!book) return res.status(404).json({ message: 'Book not found' })

  book.reviews[req.user.username] = review
  await db.write()
  res.json({ message: 'Review added/updated', book })
})

// Delete review by user
router.delete('/:isbn/review', authenticate, async (req, res) => {
  const { isbn } = req.params
  const book = db.data.books.find(b => b.isbn === isbn)
  if (!book) return res.status(404).json({ message: 'Book not found' })

  if (book.reviews[req.user.username]) {
    delete book.reviews[req.user.username]
    await db.write()
    res.json({ message: 'Review deleted' })
  } else {
    res.status(403).json({ message: 'No review found for this user' })
  }
})

export default router
