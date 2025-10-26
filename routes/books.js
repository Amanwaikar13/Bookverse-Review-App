const express = require('express');
const router = express.Router();
const Joi = require('joi');
const shortid = require('shortid');
const { db } = require('../db');
const { requireUser } = require('../middleware/auth');

const reviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().max(1000).allow('').optional()
});

// Public: get all books
router.get('/', async (req, res) => {
  await db.read();
  res.json(db.data.books);
});

// Public: get by ISBN
router.get('/:isbn', async (req, res) => {
  await db.read();
  const book = db.data.books.find(b => b.isbn === req.params.isbn);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json(book);
});

// Public: search by author or title (query params)
router.get('/search/by', async (req, res) => {
  await db.read();
  const { author, title } = req.query;
  let results = db.data.books;
  if (author) {
    results = results.filter(b => b.author.toLowerCase().includes(author.toLowerCase()));
  }
  if (title) {
    results = results.filter(b => b.title.toLowerCase().includes(title.toLowerCase()));
  }
  res.json(results);
});

// Protected: add a review (registered user)
router.post('/:isbn/review', requireUser, async (req, res) => {
  await db.read();
  const { error, value } = reviewSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  const book = db.data.books.find(b => b.isbn === req.params.isbn);
  if (!book) return res.status(404).json({ error: 'Book not found' });

  const review = {
    id: shortid.generate(),
    user: req.user.username || req.user.email,
    rating: value.rating,
    comment: value.comment || '',
    history: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  book.reviews.push(review);
  await db.write();
  res.status(201).json({ message: 'Review added', review });
});

// Protected: update review (only author)
router.put('/:isbn/review/:reviewId', requireUser, async (req, res) => {
  await db.read();
  const { error, value } = reviewSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  const book = db.data.books.find(b => b.isbn === req.params.isbn);
  if (!book) return res.status(404).json({ error: 'Book not found' });

  const review = book.reviews.find(r => r.id === req.params.reviewId);
  if (!review) return res.status(404).json({ error: 'Review not found' });

  const username = req.user.username || req.user.email;
  if (review.user !== username) return res.status(403).json({ error: 'Only review owner can edit' });

  // push previous state to history
  review.history.push({
    rating: review.rating,
    comment: review.comment,
    editedAt: review.updatedAt
  });

  review.rating = value.rating;
  review.comment = value.comment || '';
  review.updatedAt = new Date().toISOString();

  await db.write();
  res.json({ message: 'Review updated', review });
});

// Protected: delete review (only author)
router.delete('/:isbn/review/:reviewId', requireUser, async (req, res) => {
  await db.read();
  const book = db.data.books.find(b => b.isbn === req.params.isbn);
  if (!book) return res.status(404).json({ error: 'Book not found' });

  const reviewIndex = book.reviews.findIndex(r => r.id === req.params.reviewId);
  if (reviewIndex === -1) return res.status(404).json({ error: 'Review not found' });

  const review = book.reviews[reviewIndex];
  const username = req.user.username || req.user.email;
  if (review.user !== username) return res.status(403).json({ error: 'Only review owner can delete' });

  book.reviews.splice(reviewIndex, 1);
  await db.write();
  res.json({ message: 'Review deleted' });
});

module.exports = router;
