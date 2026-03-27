const router = require('express').Router()
const bcrypt = require('bcryptjs')
const db     = require('../db/database')
const auth   = require('../middleware/auth')

function uid() { return Math.random().toString(36).slice(2, 10) }
const safe = u => { const { password_hash, ...rest } = u; return rest }

// GET /api/users — all sub-users (non-owner)
router.get('/', auth, (req, res) => {
  const users = db.prepare("SELECT * FROM users WHERE role != 'owner' ORDER BY name").all()
  res.json(users.map(safe))
})

// POST /api/users — create sub-user
router.post('/', auth, (req, res) => {
  const { name, email, phone, password, department, profileImage } = req.body
  if (!name || !password) return res.status(400).json({ error: 'Name and password required' })

  const id   = uid()
  const hash = bcrypt.hashSync(password, 10)
  db.prepare(`
    INSERT INTO users (id, name, email, phone, password_hash, role, department, profile_image, status)
    VALUES (?, ?, ?, ?, ?, 'staff', ?, ?, 'active')
  `).run(id, name, email || null, phone || null, hash, department || null, profileImage || null)

  res.status(201).json(safe(db.prepare('SELECT * FROM users WHERE id = ?').get(id)))
})

// PUT /api/users/:id — update sub-user
router.put('/:id', auth, (req, res) => {
  const { name, phone, email, department, profileImage, status, password } = req.body
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id)
  if (!user) return res.status(404).json({ error: 'User not found' })

  const hash = password ? bcrypt.hashSync(password, 10) : user.password_hash
  db.prepare(`
    UPDATE users SET name=?, email=?, phone=?, department=?, profile_image=?, status=?, password_hash=?
    WHERE id=?
  `).run(
    name ?? user.name,
    email ?? user.email,
    phone ?? user.phone,
    department ?? user.department,
    profileImage ?? user.profile_image,
    status ?? user.status,
    hash,
    req.params.id
  )
  res.json(safe(db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id)))
})

// DELETE /api/users/:id
router.delete('/:id', auth, (req, res) => {
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

module.exports = router
