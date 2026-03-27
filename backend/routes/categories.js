const router = require('express').Router()
const db     = require('../db/database')
const auth   = require('../middleware/auth')

function uid() { return Math.random().toString(36).slice(2, 10) }

// GET /api/categories
router.get('/', auth, (req, res) => {
  res.json(db.prepare('SELECT * FROM expense_categories ORDER BY name').all())
})

// POST /api/categories
router.post('/', auth, (req, res) => {
  const { name, color, icon, personInCharge, remark } = req.body
  if (!name) return res.status(400).json({ error: 'Name required' })
  const id = uid()
  db.prepare('INSERT INTO expense_categories (id, name, color, icon, person_in_charge, remark) VALUES (?,?,?,?,?,?)')
    .run(id, name, color || '#1E3A8A', icon || 'Package', personInCharge || null, remark || null)
  res.status(201).json({ id })
})

// PUT /api/categories/:id
router.put('/:id', auth, (req, res) => {
  const { name, color, icon, personInCharge, remark } = req.body
  db.prepare('UPDATE expense_categories SET name=?, color=?, icon=?, person_in_charge=?, remark=? WHERE id=?')
    .run(name, color, icon, personInCharge || null, remark || null, req.params.id)
  res.json({ ok: true })
})

// DELETE /api/categories/:id
router.delete('/:id', auth, (req, res) => {
  db.prepare('DELETE FROM expense_categories WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

module.exports = router
