const router = require('express').Router()
const db     = require('../db/database')
const auth   = require('../middleware/auth')

function uid() { return Math.random().toString(36).slice(2, 10) }

// Build nested tree from flat rows
function buildTree(nodes) {
  const map = {}
  nodes.forEach(n => { map[n.id] = { ...n, children: [] } })
  const roots = []
  nodes.forEach(n => {
    if (n.parent_id) map[n.parent_id]?.children.push(map[n.id])
    else roots.push(map[n.id])
  })
  return roots
}

// GET /api/budgets?year=2026
router.get('/', auth, (req, res) => {
  const { year } = req.query
  // Get L1 nodes for the year, then all their descendants
  const l1 = db.prepare(
    year ? 'SELECT id FROM budget_nodes WHERE level=1 AND year=?' : 'SELECT id FROM budget_nodes WHERE level=1'
  ).all(...(year ? [year] : []))

  if (!l1.length) return res.json([])

  const ids = l1.map(n => n.id)
  // Recursive CTE to get entire subtree
  const allNodes = db.prepare(`
    WITH RECURSIVE subtree(id) AS (
      SELECT id FROM budget_nodes WHERE id IN (${ids.map(() => '?').join(',')})
      UNION ALL
      SELECT n.id FROM budget_nodes n JOIN subtree s ON n.parent_id = s.id
    )
    SELECT bn.* FROM budget_nodes bn JOIN subtree s ON bn.id = s.id
    ORDER BY bn.code
  `).all(...ids)

  res.json(buildTree(allNodes))
})

// GET /api/budgets/years — available years
router.get('/years', auth, (req, res) => {
  const years = db.prepare('SELECT DISTINCT year FROM budget_nodes WHERE level=1 AND year IS NOT NULL ORDER BY year DESC').all()
  res.json(years.map(r => r.year))
})

// POST /api/budgets/import — import flat rows for a year
router.post('/import', auth, (req, res) => {
  const { year, rows } = req.body  // rows: [{code, name, parentCode, budgeted, spent}]
  if (!year || !Array.isArray(rows)) return res.status(400).json({ error: 'year and rows required' })

  const deleteYear = db.prepare(`
    DELETE FROM budget_nodes WHERE id IN (
      SELECT id FROM budget_nodes WHERE level=1 AND year=?
      UNION ALL
      SELECT n.id FROM budget_nodes n
      JOIN budget_nodes l1 ON n.parent_id = l1.id WHERE l1.level=1 AND l1.year=?
    )
  `)

  const insert = db.prepare('INSERT INTO budget_nodes (id, code, name, parent_id, level, year, budgeted, spent) VALUES (?,?,?,?,?,?,?,?)')

  db.transaction(() => {
    deleteYear.run(year, year)

    const nodeMap = {}  // code → id

    // Pass 1: L1
    rows.filter(r => r.code?.length === 2).forEach(r => {
      const id = uid()
      nodeMap[r.code] = id
      insert.run(id, r.code, r.name, null, 1, year, 0, 0)
    })
    // Pass 2: L2
    rows.filter(r => r.code?.length === 4).forEach(r => {
      const id       = uid()
      const parentId = nodeMap[r.parentCode] || nodeMap[r.code.slice(0,2)]
      nodeMap[r.code] = id
      insert.run(id, r.code, r.name, parentId || null, 2, null, 0, 0)
    })
    // Pass 3: L3
    rows.filter(r => r.code?.length === 5).forEach(r => {
      const id       = uid()
      const parentId = nodeMap[r.parentCode] || nodeMap[r.code.slice(0,4)]
      insert.run(id, r.code, r.name, parentId || null, 3, null, r.budgeted || 0, r.spent || 0)
    })
  })()

  res.json({ ok: true })
})

module.exports = router
