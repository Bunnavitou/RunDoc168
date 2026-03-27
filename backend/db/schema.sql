PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ─── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  email          TEXT UNIQUE,
  phone          TEXT,
  password_hash  TEXT NOT NULL,
  role           TEXT NOT NULL DEFAULT 'staff',  -- owner | manager | staff | viewer
  department     TEXT,
  profile_image  TEXT,
  status         TEXT NOT NULL DEFAULT 'active', -- active | inactive
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Approval Types ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS approval_types (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS approval_steps (
  id               TEXT PRIMARY KEY,
  approval_type_id TEXT NOT NULL REFERENCES approval_types(id) ON DELETE CASCADE,
  step_order       INTEGER NOT NULL,
  role             TEXT NOT NULL,
  person_in_charge TEXT
);

-- ─── Expense Categories ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expense_categories (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  color            TEXT NOT NULL DEFAULT '#1E3A8A',
  icon             TEXT NOT NULL DEFAULT 'Package',
  person_in_charge TEXT,
  remark           TEXT,
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Budget Tree ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS budget_nodes (
  id        TEXT PRIMARY KEY,
  code      TEXT NOT NULL,
  name      TEXT NOT NULL,
  parent_id TEXT REFERENCES budget_nodes(id) ON DELETE CASCADE,
  level     INTEGER NOT NULL,  -- 1 | 2 | 3
  year      INTEGER,           -- only L1 nodes have year
  budgeted  REAL DEFAULT 0,    -- only L3 nodes
  spent     REAL DEFAULT 0     -- only L3 nodes
);

CREATE INDEX IF NOT EXISTS idx_budget_nodes_parent ON budget_nodes(parent_id);
CREATE INDEX IF NOT EXISTS idx_budget_nodes_year   ON budget_nodes(year);

-- ─── Requests ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS requests (
  id               TEXT PRIMARY KEY,
  request_no       TEXT NOT NULL UNIQUE,
  title            TEXT NOT NULL,
  amount           REAL NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  requester_id     TEXT REFERENCES users(id),
  requester_name   TEXT NOT NULL,
  department       TEXT,
  date             TEXT NOT NULL,
  register_date    TEXT,
  description      TEXT,
  priority         TEXT NOT NULL DEFAULT 'normal',  -- normal | urgent
  note             TEXT,
  approval_type_id TEXT REFERENCES approval_types(id),
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_date   ON requests(date);

CREATE TABLE IF NOT EXISTS request_items (
  id          TEXT PRIMARY KEY,
  request_id  TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  budget_code TEXT,
  amount      REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS request_photos (
  id         TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  url        TEXT NOT NULL
);

-- ─── Approval History ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS request_approvals (
  id          TEXT PRIMARY KEY,
  request_id  TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  step        INTEGER NOT NULL,
  role        TEXT NOT NULL,
  approver    TEXT,
  status      TEXT NOT NULL DEFAULT 'pending',
  remark      TEXT,
  actioned_at TEXT
);

-- ─── Comments ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS request_comments (
  id         TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  author     TEXT NOT NULL,
  role       TEXT,
  text       TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
