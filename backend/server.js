require('dotenv').config()

const express     = require('express')
const helmet      = require('helmet')
const compression = require('compression')
const cors        = require('cors')
const morgan      = require('morgan')

const app  = express()
const PORT = process.env.PORT || 4000

// ── Security & Performance middleware ─────────────────────────────────────────
app.use(helmet())
app.use(compression())  // gzip all responses
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))  // support base64 images

// Logging (skip in test)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
}

// Cache-control for API responses
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store')
  next()
})

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',           require('./routes/auth'))
app.use('/api/users',          require('./routes/users'))
app.use('/api/requests',       require('./routes/requests'))
app.use('/api/approval-types', require('./routes/approvalTypes'))
app.use('/api/categories',     require('./routes/categories'))
app.use('/api/budgets',        require('./routes/budgets'))

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }))

// 404 fallback
app.use((req, res) => res.status(404).json({ error: 'Not found' }))

// Error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  RunDoc API running → http://localhost:${PORT}`)
  console.log(`    DB: ${process.env.DB_PATH || './db/rundoc.db'}`)
})
