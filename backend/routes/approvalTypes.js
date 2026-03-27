const router = require('express').Router()
const db     = require('../db/database')
const auth   = require('../middleware/auth')

function uid() { return Math.random().toString(36).slice(2, 10) }

function withSteps(types) {
  const ids   = types.map(t => t.id)
  if (!ids.length) return types
  const steps = db.prepare(
    `SELECT * FROM approval_steps WHERE approval_type_id IN (${ids.map(() => '?').join(',')}) ORDER BY step_order`)
    .all(...ids)
  return types.map(t => ({
    ...t,
    steps: steps.filter(s => s.approval_type_id === t.id).map(s => ({
      role: s.role, personInCharge: s.person_in_charge
    }))
  }))
}

// GET /api/approval-types
router.get('/', auth, (req, res) => {
  const types = db.prepare('SELECT * FROM approval_types ORDER BY name').all()
  res.json(withSteps(types))
})

// POST /api/approval-types
router.post('/', auth, (req, res) => {
  const { name, description, steps = [] } = req.body
  if (!name) return res.status(400).json({ error: 'Name required' })

  const id = uid()
  db.prepare('INSERT INTO approval_types (id, name, description) VALUES (?,?,?)')
    .run(id, name, description || null)

  steps.forEach((s, i) => {
    db.prepare('INSERT INTO approval_steps (id, approval_type_id, step_order, role, person_in_charge) VALUES (?,?,?,?,?)')
      .run(uid(), id, i + 1, s.role, s.personInCharge || null)
  })

  res.status(201).json({ id })
})

// PUT /api/approval-types/:id
router.put('/:id', auth, (req, res) => {
  const { name, description, steps = [] } = req.body
  db.prepare('UPDATE approval_types SET name=?, description=? WHERE id=?')
    .run(name, description || null, req.params.id)

  db.prepare('DELETE FROM approval_steps WHERE approval_type_id = ?').run(req.params.id)
  steps.forEach((s, i) => {
    db.prepare('INSERT INTO approval_steps (id, approval_type_id, step_order, role, person_in_charge) VALUES (?,?,?,?,?)')
      .run(uid(), req.params.id, i + 1, s.role, s.personInCharge || null)
  })

  res.json({ ok: true })
})

// DELETE /api/approval-types/:id
router.delete('/:id', auth, (req, res) => {
  db.prepare('DELETE FROM approval_types WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

module.exports = router
