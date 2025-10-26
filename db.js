const { Low } = require('lowdb')
const { JSONFile } = require('lowdb/node')
const path = require('path')

// ✅ Provide default structure immediately
const defaultData = { users: [], books: [] }

const file = path.resolve(__dirname, 'db.json')
const adapter = new JSONFile(file)
const db = new Low(adapter, defaultData)

async function initDB() {
  await db.read()
  // if db.json is empty, initialize with defaultData
  if (!db.data) {
    db.data = defaultData
    await db.write()
  }
}

module.exports = { db, initDB }
