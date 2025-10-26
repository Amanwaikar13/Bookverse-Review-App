/**
 * Demonstrates:
 *  - async/await : retrieve all books
 *  - Promises : search by ISBN and then by author/title
 *
 * Run with: npm run client-crud
 */

const axios = require('axios');

const BASE = 'http://localhost:3000';

async function getAllBooks() {
  console.log('--- GET all books (async/await) ---');
  try {
    const res = await axios.get(`${BASE}/books`);
    console.log('Books count:', res.data.length);
  } catch (err) {
    console.error('Error fetching books', err?.response?.data || err.message);
  }
}

// Uses Promises for chaining
function searchByIsbnThenAuthor(isbn, author) {
  console.log('--- search by ISBN then by author (Promises) ---');
  return axios
    .get(`${BASE}/books/${isbn}`)
    .then(res => {
      console.log('Found by ISBN:', res.data.title);
      // then search by author
      return axios.get(`${BASE}/books/search/by`, { params: { author } });
    })
    .then(res2 => {
      console.log(`Books by ${author}:`, res2.data.map(b => b.title).join(', ') || 'none');
    })
    .catch(err => {
      console.error('Search error', err?.response?.data || err.message);
    });
}

async function run() {
  await getAllBooks();
  await searchByIsbnThenAuthor('9780140449136', 'Homer');
}

run();
