const Database = require('better-sqlite3')
const path     = require('path')
const fs       = require('fs')

require('dotenv').config({ path: path.join(__dirname, '../.env') })

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'rundoc.db')

const db = new Database(DB_PATH, {
  // WAL mode for concurrent reads + faster writes
  fileMustExist: false,
})

// Performance pragmas — run once on open
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')
db.pragma('synchronous = NORMAL')  // safe + fast (not FULL)
db.pragma('cache_size = -32000')   // 32 MB page cache
db.pragma('temp_store = MEMORY')
db.pragma('mmap_size = 268435456') // 256 MB memory-mapped I/O

// Apply schema on first run
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
db.exec(schema)

module.exports = db
