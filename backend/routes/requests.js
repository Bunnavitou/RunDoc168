const router = require('express').Router()
const db     = require('../db/database')
const auth   = require('../middleware/auth')

function uid() { return Math.random().toString(36).slice(2, 10) }

// Attach items to requests
function withItems(requests) {
  const ids   = requests.map(r => r.id)
  if (!ids.length) return requests
  const items = db.prepare(
    `SELECT * FROM request_items WHERE request_id IN (${ids.map(() => '?').join(',')})`)
    .all(...ids)
  return requests.map(r => ({ ...r, items: items.filter(i => i.request_id === r.id) }))
}

// GET /api/requests
router.get('/', auth, (req, res) => {
  const { status, year, month } = req.query
  let sql    = 'SELECT * FROM requests WHERE 1=1'
  const args = []

  if (status) { sql += ' AND status = ?'; args.push(status) }
  if (year)   { sql += " AND strftime('%Y', date) = ?"; args.push(String(year)) }
  if (month)  { sql += " AND strftime('%m', date) = ?"; args.push(String(month).padStart(2, '0')) }

  sql += ' ORDER BY date DESC'
  const rows = db.prepare(sql).all(...args)
  res.json(withItems(rows))
})

// GET /api/requests/:id
router.get('/:id', auth, (req, res) => {
  const req_ = db.prepare('SELECT * FROM requests WHERE id = ?').get(req.params.id)
  if (!req_) return res.status(404).json({ error: 'Not found' })
  const items    = db.prepare('SELECT * FROM request_items WHERE request_id = ?').all(req.params.id)
  const approvals = db.prepare('SELECT * FROM request_approvals WHERE request_id = ? ORDER BY step').all(req.params.id)
  const comments = db.prepare('SELECT * FROM request_comments WHERE request_id = ? ORDER BY created_at').all(req.params.id)
  res.json({ ...req_, items, approvals, comments })
})

// POST /api/requests
router.post('/', auth, (req, res) => {
  const { requestNo, title, amount, department, date, registerDate, description,
          priority, note, approvalTypeId, requesterName, items = [] } = req.body

  const id = uid()
  db.prepare(`
    INSERT INTO requests
      (id, request_no, title, amount, status, requester_id, requester_name, department,
       date, register_date, description, priority, note, approval_type_id)
    VALUES (?,?,?,?,'pending',?,?,?,?,?,?,?,?,?)
  `).run(id, requestNo, title, amount, req.user.id, requesterName,
         department, date, registerDate || null, description || null,
         priority || 'normal', note || null, approvalTypeId || null)

  items.forEach(item => {
    db.prepare('INSERT INTO request_items (id, request_id, name, budget_code, amount) VALUES (?,?,?,?,?)')
      .run(uid(), id, item.name, item.budgetCode || null, item.amount)
  })

  res.status(201).json({ id })
})

// PATCH /api/requests/:id/status
router.patch('/:id/status', auth, (req, res) => {
  const { status, remark } = req.body
  if (!['pending','approved','rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' })
  }
  db.prepare('UPDATE requests SET status = ? WHERE id = ?').run(status, req.params.id)
  res.json({ ok: true })
})

// DELETE /api/requests/:id
router.delete('/:id', auth, (req, res) => {
  db.prepare('DELETE FROM requests WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

module.exports = router
