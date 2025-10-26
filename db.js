// db.js
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const file = join(__dirname, 'data.json')

const adapter = new JSONFile(file)
const db = new Low(adapter, {
  users: [],
  books: [
    {
      isbn: '978-0140449136',
      title: 'The Odyssey',
      author: 'Homer',
      reviews: {}
    },
    {
      isbn: '978-0061120084',
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      reviews: {}
    }
  ]
})

await db.read()
await db.write()

export default db
