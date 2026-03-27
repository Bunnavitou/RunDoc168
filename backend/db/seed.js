const bcrypt = require('bcryptjs')
const { v4: uuid } = require('crypto')
const db = require('./database')

function uid() { return Math.random().toString(36).slice(2, 10) }

console.log('🌱  Seeding database…')

const insert = db.transaction(() => {

  // ── Users ─────────────────────────────────────────────────────────────────
  const upsertUser = db.prepare(`
    INSERT OR IGNORE INTO users (id, name, email, phone, password_hash, role, department, status)
    VALUES (@id, @name, @email, @phone, @password_hash, @role, @department, @status)
  `)

  const hash = bcrypt.hashSync('password123', 10)

  const users = [
    { id: 'u0', name: 'Somchai Kongchai',  email: 'owner@rundoc.app',    phone: '012-000-001', password_hash: hash, role: 'owner',   department: 'Management', status: 'active' },
    { id: 'u1', name: 'Nipa Thongchai',    email: 'nipa@rundoc.app',     phone: '012-000-002', password_hash: hash, role: 'manager', department: 'Finance',    status: 'active' },
    { id: 'u2', name: 'Dara Sopheak',      email: 'dara@rundoc.app',     phone: '012-000-003', password_hash: hash, role: 'staff',   department: 'IT',         status: 'active' },
    { id: 'u3', name: 'Boonsri Malee',     email: 'boonsri@rundoc.app',  phone: '012-000-004', password_hash: hash, role: 'staff',   department: 'Finance',    status: 'active' },
    { id: 'u4', name: 'Arisa Pattana',     email: 'arisa@rundoc.app',    phone: '012-000-005', password_hash: hash, role: 'staff',   department: 'Operations', status: 'active' },
  ]
  users.forEach(u => upsertUser.run(u))

  // ── Approval Types ─────────────────────────────────────────────────────────
  const upsertAT  = db.prepare(`INSERT OR IGNORE INTO approval_types (id, name, description) VALUES (@id, @name, @description)`)
  const upsertAS  = db.prepare(`INSERT OR IGNORE INTO approval_steps (id, approval_type_id, step_order, role, person_in_charge) VALUES (@id, @approval_type_id, @step_order, @role, @person_in_charge)`)

  const types = [
    { id: 'ap-standard',  name: 'Standard Purchase',  description: 'General purchases and operational expenses' },
    { id: 'ap-it',        name: 'IT Purchase',         description: 'Hardware, software licenses, and cloud services' },
    { id: 'ap-marketing', name: 'Marketing Purchase',  description: 'Campaigns, print materials, and branding' },
    { id: 'ap-emergency', name: 'Emergency Purchase',  description: 'Urgent items that require fast-track approval' },
    { id: 'ap-small',     name: 'Small Amount',        description: 'Low-value items with streamlined single-step approval' },
  ]
  types.forEach(t => upsertAT.run(t))

  const steps = [
    { id: uid(), approval_type_id: 'ap-standard',  step_order: 1, role: 'Line Manager',    person_in_charge: 'Somchai Kongchai' },
    { id: uid(), approval_type_id: 'ap-standard',  step_order: 2, role: 'Finance Manager', person_in_charge: 'Nipa Thongchai'   },
    { id: uid(), approval_type_id: 'ap-standard',  step_order: 3, role: 'Director',        person_in_charge: 'Somchai Kongchai' },
    { id: uid(), approval_type_id: 'ap-it',        step_order: 1, role: 'IT Manager',      person_in_charge: 'Dara Sopheak'     },
    { id: uid(), approval_type_id: 'ap-it',        step_order: 2, role: 'Finance Manager', person_in_charge: 'Nipa Thongchai'   },
    { id: uid(), approval_type_id: 'ap-it',        step_order: 3, role: 'Director',        person_in_charge: 'Somchai Kongchai' },
    { id: uid(), approval_type_id: 'ap-marketing', step_order: 1, role: 'Marketing Lead',  person_in_charge: 'Nipa Thongchai'   },
    { id: uid(), approval_type_id: 'ap-marketing', step_order: 2, role: 'Finance Manager', person_in_charge: 'Nipa Thongchai'   },
    { id: uid(), approval_type_id: 'ap-marketing', step_order: 3, role: 'Director',        person_in_charge: 'Somchai Kongchai' },
    { id: uid(), approval_type_id: 'ap-emergency', step_order: 1, role: 'Finance Manager', person_in_charge: 'Nipa Thongchai'   },
    { id: uid(), approval_type_id: 'ap-emergency', step_order: 2, role: 'Director',        person_in_charge: 'Somchai Kongchai' },
    { id: uid(), approval_type_id: 'ap-small',     step_order: 1, role: 'Line Manager',    person_in_charge: 'Somchai Kongchai' },
  ]
  steps.forEach(s => upsertAS.run(s))

  // ── Expense Categories ─────────────────────────────────────────────────────
  const upsertCat = db.prepare(`
    INSERT OR IGNORE INTO expense_categories (id, name, color, icon, person_in_charge, remark)
    VALUES (@id, @name, @color, @icon, @person_in_charge, @remark)
  `)

  const categories = [
    { id: 'cat-1', name: 'Angkor Office Supplies Co., Ltd', color: '#1E3A8A', icon: 'Package',       person_in_charge: 'Somchai Kongchai', remark: 'Main stationery & office goods vendor' },
    { id: 'cat-2', name: 'CamAir Travel Services',          color: '#0891B2', icon: 'Plane',         person_in_charge: 'Nipa Thongchai',   remark: 'Domestic & international flight booking' },
    { id: 'cat-3', name: 'Golden Kitchen & Events',         color: '#D97706', icon: 'Utensils',      person_in_charge: 'Boonsri Malee',    remark: 'Catering, team meals, client entertainment' },
    { id: 'cat-4', name: 'Mekong Tech Solutions',           color: '#7C3AED', icon: 'Monitor',       person_in_charge: 'Dara Sopheak',     remark: 'IT hardware, software licenses & cloud' },
    { id: 'cat-5', name: 'Royal Media Group',               color: '#DB2777', icon: 'Megaphone',     person_in_charge: 'Nipa Thongchai',   remark: 'Marketing, advertising & branding' },
    { id: 'cat-6', name: 'Phnom Penh Furniture Co., Ltd',   color: '#059669', icon: 'Armchair',      person_in_charge: 'Somchai Kongchai', remark: 'Office furniture & equipment supplier' },
    { id: 'cat-7', name: 'Bayon Learning Center',           color: '#EA580C', icon: 'GraduationCap', person_in_charge: 'Dara Sopheak',     remark: 'Training courses, certifications, seminars' },
  ]
  categories.forEach(c => upsertCat.run(c))

  // ── Budget Nodes ───────────────────────────────────────────────────────────
  const upsertNode = db.prepare(`
    INSERT OR IGNORE INTO budget_nodes (id, code, name, parent_id, level, year, budgeted, spent)
    VALUES (@id, @code, @name, @parent_id, @level, @year, @budgeted, @spent)
  `)

  const nodes = [
    // L1
    { id: 'n01',    code: '01',    name: 'Operations',         parent_id: null,  level: 1, year: 2026, budgeted: 0, spent: 0 },
    { id: 'n02',    code: '02',    name: 'Technology',         parent_id: null,  level: 1, year: 2026, budgeted: 0, spent: 0 },
    { id: 'n03',    code: '03',    name: 'Marketing',          parent_id: null,  level: 1, year: 2026, budgeted: 0, spent: 0 },
    { id: 'n04',    code: '04',    name: 'Human Resources',    parent_id: null,  level: 1, year: 2026, budgeted: 0, spent: 0 },
    { id: 'n05',    code: '05',    name: 'Business Dev',       parent_id: null,  level: 1, year: 2026, budgeted: 0, spent: 0 },
    // L2
    { id: 'n0101',  code: '0101',  name: 'Office Expenses',    parent_id: 'n01', level: 2, year: null, budgeted: 0, spent: 0 },
    { id: 'n0102',  code: '0102',  name: 'Facilities',         parent_id: 'n01', level: 2, year: null, budgeted: 0, spent: 0 },
    { id: 'n0201',  code: '0201',  name: 'Hardware',           parent_id: 'n02', level: 2, year: null, budgeted: 0, spent: 0 },
    { id: 'n0202',  code: '0202',  name: 'Software & Licenses',parent_id: 'n02', level: 2, year: null, budgeted: 0, spent: 0 },
    { id: 'n0203',  code: '0203',  name: 'Cloud Services',     parent_id: 'n02', level: 2, year: null, budgeted: 0, spent: 0 },
    { id: 'n0301',  code: '0301',  name: 'Digital Advertising',parent_id: 'n03', level: 2, year: null, budgeted: 0, spent: 0 },
    { id: 'n0302',  code: '0302',  name: 'Print & Materials',  parent_id: 'n03', level: 2, year: null, budgeted: 0, spent: 0 },
    { id: 'n0401',  code: '0401',  name: 'Meals & Entertain',  parent_id: 'n04', level: 2, year: null, budgeted: 0, spent: 0 },
    { id: 'n0402',  code: '0402',  name: 'Training & Dev',     parent_id: 'n04', level: 2, year: null, budgeted: 0, spent: 0 },
    { id: 'n0501',  code: '0501',  name: 'Travel',             parent_id: 'n05', level: 2, year: null, budgeted: 0, spent: 0 },
    { id: 'n0502',  code: '0502',  name: 'Client Entertain',   parent_id: 'n05', level: 2, year: null, budgeted: 0, spent: 0 },
    // L3
    { id: 'n01011', code: '01011', name: 'Stationery',           parent_id: 'n0101', level: 3, year: null, budgeted: 12000000, spent: 8400000  },
    { id: 'n01012', code: '01012', name: 'Printing & Copying',   parent_id: 'n0101', level: 3, year: null, budgeted: 8000000,  spent: 7400000  },
    { id: 'n01013', code: '01013', name: 'Office Furniture',     parent_id: 'n0101', level: 3, year: null, budgeted: 20000000, spent: 11000000 },
    { id: 'n01021', code: '01021', name: 'Utilities',            parent_id: 'n0102', level: 3, year: null, budgeted: 16000000, spent: 12800000 },
    { id: 'n01022', code: '01022', name: 'Maintenance',          parent_id: 'n0102', level: 3, year: null, budgeted: 12000000, spent: 7200000  },
    { id: 'n02011', code: '02011', name: 'Computers & Laptops',  parent_id: 'n0201', level: 3, year: null, budgeted: 32000000, spent: 28800000 },
    { id: 'n02012', code: '02012', name: 'Peripherals',          parent_id: 'n0201', level: 3, year: null, budgeted: 8000000,  spent: 2600000  },
    { id: 'n02021', code: '02021', name: 'Productivity Suite',   parent_id: 'n0202', level: 3, year: null, budgeted: 12000000, spent: 12000000 },
    { id: 'n02022', code: '02022', name: 'Design Tools',         parent_id: 'n0202', level: 3, year: null, budgeted: 9600000,  spent: 7200000  },
    { id: 'n02023', code: '02023', name: 'Communication Apps',   parent_id: 'n0202', level: 3, year: null, budgeted: 7200000,  spent: 3600000  },
    { id: 'n02031', code: '02031', name: 'Cloud Hosting',        parent_id: 'n0203', level: 3, year: null, budgeted: 24000000, spent: 22000000 },
    { id: 'n02032', code: '02032', name: 'Data Storage',         parent_id: 'n0203', level: 3, year: null, budgeted: 4800000,  spent: 1920000  },
    { id: 'n03011', code: '03011', name: 'Social Media Ads',     parent_id: 'n0301', level: 3, year: null, budgeted: 60000000, spent: 56800000 },
    { id: 'n03012', code: '03012', name: 'Search Engine Ads',    parent_id: 'n0301', level: 3, year: null, budgeted: 48000000, spent: 39200000 },
    { id: 'n03013', code: '03013', name: 'Video Advertising',    parent_id: 'n0301', level: 3, year: null, budgeted: 32000000, spent: 20000000 },
    { id: 'n03021', code: '03021', name: 'Brochures & Flyers',   parent_id: 'n0302', level: 3, year: null, budgeted: 12000000, spent: 8800000  },
    { id: 'n03022', code: '03022', name: 'Banners & Signage',    parent_id: 'n0302', level: 3, year: null, budgeted: 8000000,  spent: 6400000  },
    { id: 'n04011', code: '04011', name: 'Team Lunch / Dinner',  parent_id: 'n0401', level: 3, year: null, budgeted: 24000000, spent: 19200000 },
    { id: 'n04012', code: '04012', name: 'Client Entertainment', parent_id: 'n0401', level: 3, year: null, budgeted: 16000000, spent: 4800000  },
    { id: 'n04021', code: '04021', name: 'Online Courses',       parent_id: 'n0402', level: 3, year: null, budgeted: 16000000, spent: 9600000  },
    { id: 'n04022', code: '04022', name: 'Conferences',          parent_id: 'n0402', level: 3, year: null, budgeted: 20000000, spent: 14000000 },
    { id: 'n04023', code: '04023', name: 'Certifications',       parent_id: 'n0402', level: 3, year: null, budgeted: 14000000, spent: 4200000  },
    { id: 'n05011', code: '05011', name: 'Domestic Flights',     parent_id: 'n0501', level: 3, year: null, budgeted: 20000000, spent: 14400000 },
    { id: 'n05012', code: '05012', name: 'Intl Flights',         parent_id: 'n0501', level: 3, year: null, budgeted: 32000000, spent: 26000000 },
    { id: 'n05013', code: '05013', name: 'Accommodation',        parent_id: 'n0501', level: 3, year: null, budgeted: 16000000, spent: 13600000 },
    { id: 'n05014', code: '05014', name: 'Ground Transport',     parent_id: 'n0501', level: 3, year: null, budgeted: 4000000,  spent: 1680000  },
    { id: 'n05021', code: '05021', name: 'Business Lunches',     parent_id: 'n0502', level: 3, year: null, budgeted: 12000000, spent: 8400000  },
    { id: 'n05022', code: '05022', name: 'Corporate Events',     parent_id: 'n0502', level: 3, year: null, budgeted: 20000000, spent: 16800000 },
  ]
  nodes.forEach(n => upsertNode.run(n))

  // ── Requests ───────────────────────────────────────────────────────────────
  const upsertReq = db.prepare(`
    INSERT OR IGNORE INTO requests
      (id, request_no, title, amount, status, requester_id, requester_name, department, date, description, priority, note, approval_type_id)
    VALUES
      (@id, @request_no, @title, @amount, @status, @requester_id, @requester_name, @department, @date, @description, @priority, @note, @approval_type_id)
  `)
  const upsertItem = db.prepare(`
    INSERT OR IGNORE INTO request_items (id, request_id, name, budget_code, amount)
    VALUES (@id, @request_id, @name, @budget_code, @amount)
  `)

  const requests = [
    { id: 'req-001', request_no: 'REQ-2026-1001', title: 'Office Supplies Q1',        amount: 5000000,  status: 'pending',  requester_id: 'u0', requester_name: 'Somchai Kongchai', department: 'Angkor Office Supplies Co., Ltd', date: '2026-03-24', description: 'Purchase of stationery, printer cartridges, and desk organizers.', priority: 'normal',  note: 'Please process before end of March.', approval_type_id: 'ap-standard' },
    { id: 'req-002', request_no: 'REQ-2026-1002', title: 'Team Lunch – March',         amount: 1920000,  status: 'approved', requester_id: 'u1', requester_name: 'Nipa Thongchai',   department: 'Golden Kitchen & Events',         date: '2026-03-22', description: 'Monthly team lunch for the HR department.',                    priority: 'normal',  note: '',                                    approval_type_id: 'ap-small'    },
    { id: 'req-003', request_no: 'REQ-2026-1003', title: 'Flight to Bangkok',           amount: 12800000, status: 'approved', requester_id: 'u0', requester_name: 'Somchai Kongchai', department: 'CamAir Travel Services',          date: '2026-02-20', description: 'Round-trip flight for annual tech conference in Bangkok.',      priority: 'urgent',  note: 'Conference dates: 28–30 March.',      approval_type_id: 'ap-emergency'},
    { id: 'req-004', request_no: 'REQ-2026-1004', title: 'Cloud Server Upgrade',        amount: 22000000, status: 'rejected', requester_id: 'u0', requester_name: 'Somchai Kongchai', department: 'Mekong Tech Solutions',           date: '2026-02-18', description: 'Upgrade cloud hosting from Standard to Business tier.',        priority: 'normal',  note: 'Estimated 15% cost reduction.',       approval_type_id: 'ap-it'       },
    { id: 'req-005', request_no: 'REQ-2026-1005', title: 'Marketing Campaign Q2',       amount: 48000000, status: 'pending',  requester_id: 'u1', requester_name: 'Nipa Thongchai',   department: 'Royal Media Group',               date: '2026-01-15', description: 'Digital marketing campaign for Q2 product launch.',            priority: 'urgent',  note: 'Campaign must launch by 1 April.',    approval_type_id: 'ap-marketing'},
    { id: 'req-006', request_no: 'REQ-2026-1006', title: 'Ergonomic Chairs (x5)',       amount: 11000000, status: 'pending',  requester_id: 'u3', requester_name: 'Boonsri Malee',    department: 'Phnom Penh Furniture Co., Ltd',   date: '2026-01-12', description: 'Five ergonomic office chairs for the 2nd floor workstation.',  priority: 'normal',  note: '',                                    approval_type_id: 'ap-standard' },
  ]
  requests.forEach(r => upsertReq.run(r))

  const items = [
    { id: uid(), request_id: 'req-001', name: 'Stationery',         budget_code: '01011', amount: 1200000 },
    { id: uid(), request_id: 'req-001', name: 'Printing & Copying', budget_code: '01012', amount: 1800000 },
    { id: uid(), request_id: 'req-001', name: 'Office Furniture',   budget_code: '01013', amount: 2000000 },
    { id: uid(), request_id: 'req-002', name: 'Team Lunch / Dinner',budget_code: '04011', amount: 1920000 },
    { id: uid(), request_id: 'req-003', name: 'Intl Flights',       budget_code: '05012', amount: 8000000 },
    { id: uid(), request_id: 'req-003', name: 'Accommodation',      budget_code: '05013', amount: 3200000 },
    { id: uid(), request_id: 'req-003', name: 'Ground Transport',   budget_code: '05014', amount: 1600000 },
    { id: uid(), request_id: 'req-004', name: 'Cloud Hosting',      budget_code: '02031', amount: 22000000},
    { id: uid(), request_id: 'req-005', name: 'Social Media Ads',   budget_code: '03011', amount: 16000000},
    { id: uid(), request_id: 'req-005', name: 'Search Engine Ads',  budget_code: '03012', amount: 16000000},
    { id: uid(), request_id: 'req-005', name: 'Brochures & Flyers', budget_code: '03021', amount: 8000000 },
    { id: uid(), request_id: 'req-005', name: 'Banners & Signage',  budget_code: '03022', amount: 8000000 },
    { id: uid(), request_id: 'req-006', name: 'Office Furniture',   budget_code: '01013', amount: 11000000},
  ]
  items.forEach(i => upsertItem.run(i))
})

try {
  insert()
  console.log('✅  Seed complete.')
} catch (err) {
  console.error('❌  Seed failed:', err.message)
  process.exit(1)
}
