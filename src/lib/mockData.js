// Shared mock data for the Purchase/Budget Management System

export const MOCK_REQUESTS = [
  {
    id: 'req-001',
    requestNo: 'REQ-2026-1001',
    title: 'Office Supplies Q1',
    category: 'Angkor Office Supplies Co., Ltd',
    amount: 5000000,
    status: 'pending',
    requester: 'Somchai Kongchai',
    department: 'Angkor Office Supplies Co., Ltd',
    date: '2026-03-24',
    description: 'Purchase of stationery, printer cartridges, and desk organizers for the Operations team in Q1.',
    priority: 'normal',
    note: 'Please process before end of March.',
    approvalTypeId: 'ap-standard',
    items: [
      { name: 'Stationery',         budgetCode: '01011', amount: 1200000 },
      { name: 'Printing & Copying', budgetCode: '01012', amount: 1800000 },
      { name: 'Office Furniture',   budgetCode: '01013', amount: 2000000 },
    ],
    photos: [],
    attachments: 2,
  },
  {
    id: 'req-002',
    requestNo: 'REQ-2026-1002',
    title: 'Team Lunch – March',
    category: 'Golden Kitchen & Events',
    amount: 1920000,
    status: 'approved',
    requester: 'Nipa Thongchai',
    department: 'Golden Kitchen & Events',
    date: '2026-03-22',
    description: 'Monthly team lunch for the HR department. Held at Riverside Restaurant on 22 March 2026.',
    priority: 'normal',
    note: '',
    approvalTypeId: 'ap-small',
    items: [
      { name: 'Team Lunch / Dinner', budgetCode: '04011', amount: 1920000 },
    ],
    photos: [],
    attachments: 1,
  },
  {
    id: 'req-003',
    requestNo: 'REQ-2026-1003',
    title: 'Flight to Bangkok – Conference',
    category: 'CamAir Travel Services',
    amount: 12800000,
    status: 'approved',
    requester: 'Tech Corp Ltd',
    department: 'CamAir Travel Services',
    date: '2026-02-20',
    description: 'Round-trip flight and accommodation for the annual tech conference in Bangkok, 28–30 March 2026.',
    priority: 'urgent',
    note: 'Conference dates: 28–30 March. Book ASAP.',
    approvalTypeId: 'ap-emergency',
    items: [
      { name: 'International Flights', budgetCode: '05012', amount: 8000000 },
      { name: 'Accommodation',         budgetCode: '05013', amount: 3200000 },
      { name: 'Ground Transport',      budgetCode: '05014', amount: 1600000 },
    ],
    photos: [],
    attachments: 3,
  },
  {
    id: 'req-004',
    requestNo: 'REQ-2026-1004',
    title: 'Cloud Server Upgrade',
    category: 'Mekong Tech Solutions',
    amount: 22000000,
    status: 'rejected',
    requester: 'Somchai Kongchai',
    department: 'Mekong Tech Solutions',
    date: '2026-02-18',
    description: 'Upgrade of cloud hosting plan from Standard to Business tier.',
    priority: 'normal',
    note: 'Estimated 15% cost reduction annually.',
    approvalTypeId: 'ap-it',
    items: [
      { name: 'Cloud Hosting', budgetCode: '02031', amount: 22000000 },
    ],
    photos: [],
    attachments: 0,
  },
  {
    id: 'req-005',
    requestNo: 'REQ-2026-1005',
    title: 'Marketing Campaign Q2',
    category: 'Royal Media Group',
    amount: 48000000,
    status: 'pending',
    requester: 'Nipa Thongchai',
    department: 'Royal Media Group',
    date: '2026-01-15',
    description: 'Digital marketing campaign covering social media ads, content creation, and influencer partnerships for Q2 product launch.',
    priority: 'urgent',
    note: 'Campaign must launch by 1 April.',
    approvalTypeId: 'ap-marketing',
    items: [
      { name: 'Social Media Ads',   budgetCode: '03011', amount: 16000000 },
      { name: 'Search Engine Ads',  budgetCode: '03012', amount: 16000000 },
      { name: 'Brochures & Flyers', budgetCode: '03021', amount: 8000000  },
      { name: 'Banners & Signage',  budgetCode: '03022', amount: 8000000  },
    ],
    photos: [],
    attachments: 4,
  },
  {
    id: 'req-006',
    requestNo: 'REQ-2026-1006',
    title: 'Ergonomic Chairs (x5)',
    category: 'Phnom Penh Furniture Co., Ltd',
    amount: 11000000,
    status: 'pending',
    requester: 'Boonsri Malee',
    department: 'Phnom Penh Furniture Co., Ltd',
    date: '2026-01-12',
    description: 'Five ergonomic office chairs for the new workstation area on the 2nd floor.',
    priority: 'normal',
    note: '',
    approvalTypeId: 'ap-standard',
    items: [
      { name: 'Office Furniture', budgetCode: '01013', amount: 11000000 },
    ],
    photos: [],
    attachments: 1,
  },
]

export const MOCK_APPROVAL_STEPS = [
  {
    step: 1,
    role: 'Line Manager',
    name: 'Somchai Kongchai',
    status: 'approved',
    date: '2026-03-22',
    remark: 'Looks good. Approved.',
  },
  {
    step: 2,
    role: 'Finance Manager',
    name: 'Nipa Thongchai',
    status: 'approved',
    date: '2026-03-23',
    remark: 'Budget available. Approved.',
  },
  {
    step: 3,
    role: 'Director',
    name: 'Tech Corp Director',
    status: 'pending',
    date: null,
    remark: '',
  },
]

export const MOCK_COMMENTS = [
  {
    id: 'c1',
    author: 'Nipa Thongchai',
    role: 'Finance Manager',
    text: 'Please attach the vendor quotation before I can approve.',
    date: '2026-03-22 09:14',
  },
  {
    id: 'c2',
    author: 'Somchai Kongchai',
    role: 'Requester',
    text: 'Attached the quotation from the vendor. Please check.',
    date: '2026-03-22 10:30',
  },
  {
    id: 'c3',
    author: 'Nipa Thongchai',
    role: 'Finance Manager',
    text: 'Received. Processing now.',
    date: '2026-03-22 11:05',
  },
]

export const MOCK_BUDGETS = [
  { id: 'b1', department: 'Operations',   period: 'Q1 2026', allocated: 20000, spent: 14800 },
  { id: 'b2', department: 'IT',           period: 'Q1 2026', allocated: 30000, spent: 12500 },
  { id: 'b3', department: 'Marketing',    period: 'Q1 2026', allocated: 50000, spent: 38000 },
  { id: 'b4', department: 'HR',           period: 'Q1 2026', allocated: 15000, spent: 9200  },
  { id: 'b5', department: 'Business Dev', period: 'Q1 2026', allocated: 25000, spent: 21000 },
]

// 3-Level Budget Tree
// L1: 2-digit code · L2: 4-digit code · L3: 5-digit code (leaf — has budgeted & spent)
export const BUDGET_TREE = [
  {
    code: '01', name: 'Operations', year: 2026,
    children: [
      {
        code: '0101', name: 'Office Expenses',
        children: [
          { code: '01011', name: 'Stationery',         budgeted: 12000000, spent: 8400000  },
          { code: '01012', name: 'Printing & Copying', budgeted: 8000000,  spent: 7400000  },
          { code: '01013', name: 'Office Furniture',   budgeted: 20000000, spent: 11000000 },
        ],
      },
      {
        code: '0102', name: 'Facilities',
        children: [
          { code: '01021', name: 'Utilities',          budgeted: 16000000, spent: 12800000 },
          { code: '01022', name: 'Maintenance',        budgeted: 12000000, spent: 7200000  },
        ],
      },
    ],
  },
  {
    code: '02', name: 'Technology', year: 2026,
    children: [
      {
        code: '0201', name: 'Hardware',
        children: [
          { code: '02011', name: 'Computers & Laptops', budgeted: 32000000, spent: 28800000 },
          { code: '02012', name: 'Peripherals',          budgeted: 8000000,  spent: 2600000  },
        ],
      },
      {
        code: '0202', name: 'Software & Licenses',
        children: [
          { code: '02021', name: 'Productivity Suite',   budgeted: 12000000, spent: 12000000 },
          { code: '02022', name: 'Design Tools',         budgeted: 9600000,  spent: 7200000  },
          { code: '02023', name: 'Communication Apps',   budgeted: 7200000,  spent: 3600000  },
        ],
      },
      {
        code: '0203', name: 'Cloud Services',
        children: [
          { code: '02031', name: 'Cloud Hosting',        budgeted: 24000000, spent: 22000000 },
          { code: '02032', name: 'Data Storage',         budgeted: 4800000,  spent: 1920000  },
        ],
      },
    ],
  },
  {
    code: '03', name: 'Marketing', year: 2026,
    children: [
      {
        code: '0301', name: 'Digital Advertising',
        children: [
          { code: '03011', name: 'Social Media Ads',    budgeted: 60000000, spent: 56800000 },
          { code: '03012', name: 'Search Engine Ads',   budgeted: 48000000, spent: 39200000 },
          { code: '03013', name: 'Video Advertising',   budgeted: 32000000, spent: 20000000 },
        ],
      },
      {
        code: '0302', name: 'Print & Materials',
        children: [
          { code: '03021', name: 'Brochures & Flyers',  budgeted: 12000000, spent: 8800000 },
          { code: '03022', name: 'Banners & Signage',   budgeted: 8000000,  spent: 6400000 },
        ],
      },
    ],
  },
  {
    code: '04', name: 'Human Resources', year: 2026,
    children: [
      {
        code: '0401', name: 'Meals & Entertainment',
        children: [
          { code: '04011', name: 'Team Lunch / Dinner',  budgeted: 24000000, spent: 19200000 },
          { code: '04012', name: 'Client Entertainment', budgeted: 16000000, spent: 4800000  },
        ],
      },
      {
        code: '0402', name: 'Training & Development',
        children: [
          { code: '04021', name: 'Online Courses',       budgeted: 16000000, spent: 9600000  },
          { code: '04022', name: 'Conferences',          budgeted: 20000000, spent: 14000000 },
          { code: '04023', name: 'Certifications',       budgeted: 14000000, spent: 4200000  },
        ],
      },
    ],
  },
  {
    code: '05', name: 'Business Development', year: 2026,
    children: [
      {
        code: '0501', name: 'Travel',
        children: [
          { code: '05011', name: 'Domestic Flights',      budgeted: 20000000, spent: 14400000 },
          { code: '05012', name: 'International Flights', budgeted: 32000000, spent: 26000000 },
          { code: '05013', name: 'Accommodation',         budgeted: 16000000, spent: 13600000 },
          { code: '05014', name: 'Ground Transport',      budgeted: 4000000,  spent: 1680000  },
        ],
      },
      {
        code: '0502', name: 'Client Entertainment',
        children: [
          { code: '05021', name: 'Business Lunches',  budgeted: 12000000, spent: 8400000  },
          { code: '05022', name: 'Corporate Events',  budgeted: 20000000, spent: 16800000 },
        ],
      },
    ],
  },
]

export const EXPENSE_TREE = [
  {
    id: 'l1-it', name: 'IT & Software',
    children: [
      { id: 'l2-hw', name: 'Hardware', children: [
        { id: 'l3-mac',  name: 'MacBook Pro 14"',      unitPrice: 1800, unit: 'unit'    },
        { id: 'l3-mon',  name: 'Dell Monitor 27"',     unitPrice: 450,  unit: 'unit'    },
        { id: 'l3-kbd',  name: 'Mechanical Keyboard',  unitPrice: 120,  unit: 'unit'    },
        { id: 'l3-hub',  name: 'USB-C Hub',            unitPrice: 65,   unit: 'unit'    },
      ]},
      { id: 'l2-sw', name: 'Software License', children: [
        { id: 'l3-ms365',  name: 'Microsoft 365 (yearly)',    unitPrice: 150, unit: 'user/yr' },
        { id: 'l3-adobe',  name: 'Adobe Creative Cloud',      unitPrice: 600, unit: 'user/yr' },
        { id: 'l3-slack',  name: 'Slack Pro',                 unitPrice: 90,  unit: 'user/yr' },
      ]},
      { id: 'l2-cloud', name: 'Cloud Services', children: [
        { id: 'l3-aws',   name: 'AWS EC2 Instance',           unitPrice: 250, unit: 'mo'      },
        { id: 'l3-gws',   name: 'Google Workspace',           unitPrice: 72,  unit: 'user/yr' },
        { id: 'l3-azure', name: 'Azure VM (Standard)',         unitPrice: 180, unit: 'mo'      },
      ]},
    ],
  },
  {
    id: 'l1-off', name: 'Office Supplies',
    children: [
      { id: 'l2-sta', name: 'Stationery', children: [
        { id: 'l3-pen',    name: 'Ballpoint Pens (box)',    unitPrice: 8,  unit: 'box'  },
        { id: 'l3-paper',  name: 'A4 Paper (ream)',         unitPrice: 6,  unit: 'ream' },
        { id: 'l3-sticky', name: 'Sticky Notes (pack)',     unitPrice: 5,  unit: 'pack' },
      ]},
      { id: 'l2-print', name: 'Printing', children: [
        { id: 'l3-inkB', name: 'Ink Cartridge – Black',    unitPrice: 35, unit: 'unit' },
        { id: 'l3-inkC', name: 'Ink Cartridge – Color',    unitPrice: 42, unit: 'unit' },
        { id: 'l3-toner',name: 'Laser Toner Cartridge',    unitPrice: 90, unit: 'unit' },
      ]},
    ],
  },
  {
    id: 'l1-travel', name: 'Travel',
    children: [
      { id: 'l2-flight', name: 'Flights', children: [
        { id: 'l3-dom',  name: 'Domestic Economy Ticket',       unitPrice: 120,  unit: 'ticket' },
        { id: 'l3-intl', name: 'International Economy Ticket',  unitPrice: 650,  unit: 'ticket' },
        { id: 'l3-biz',  name: 'Business Class Ticket',         unitPrice: 2200, unit: 'ticket' },
      ]},
      { id: 'l2-hotel', name: 'Accommodation', children: [
        { id: 'l3-hotel', name: 'Hotel Room',          unitPrice: 85,  unit: 'night' },
        { id: 'l3-apt',   name: 'Serviced Apartment',  unitPrice: 120, unit: 'night' },
      ]},
      { id: 'l2-ground', name: 'Ground Transport', children: [
        { id: 'l3-taxi', name: 'Taxi / Rideshare',  unitPrice: 20, unit: 'trip' },
        { id: 'l3-car',  name: 'Car Rental',        unitPrice: 60, unit: 'day'  },
      ]},
    ],
  },
  {
    id: 'l1-mkt', name: 'Marketing',
    children: [
      { id: 'l2-digital', name: 'Digital Ads', children: [
        { id: 'l3-fb',     name: 'Facebook / Instagram Ads', unitPrice: 500, unit: 'campaign' },
        { id: 'l3-google', name: 'Google Ads',               unitPrice: 500, unit: 'campaign' },
        { id: 'l3-tiktok', name: 'TikTok Ads',               unitPrice: 300, unit: 'campaign' },
      ]},
      { id: 'l2-printmkt', name: 'Print Materials', children: [
        { id: 'l3-flyer',   name: 'Flyer A5 (1,000 pcs)',    unitPrice: 80, unit: 'set'   },
        { id: 'l3-banner',  name: 'Banner 2×3m',             unitPrice: 55, unit: 'piece' },
        { id: 'l3-bizcard', name: 'Business Cards (500 pcs)', unitPrice: 40, unit: 'set'  },
      ]},
    ],
  },
  {
    id: 'l1-meals', name: 'Meals & Entertainment',
    children: [
      { id: 'l2-team', name: 'Team Meals', children: [
        { id: 'l3-lunch',  name: 'Team Lunch',  unitPrice: 15, unit: 'person' },
        { id: 'l3-dinner', name: 'Team Dinner', unitPrice: 25, unit: 'person' },
      ]},
      { id: 'l2-client', name: 'Client Entertainment', children: [
        { id: 'l3-clunch',  name: 'Client Lunch',  unitPrice: 50, unit: 'person' },
        { id: 'l3-cdinner', name: 'Client Dinner',  unitPrice: 80, unit: 'person' },
      ]},
    ],
  },
  {
    id: 'l1-furn', name: 'Furniture & Equipment',
    children: [
      { id: 'l2-furn', name: 'Furniture', children: [
        { id: 'l3-chair', name: 'Ergonomic Chair',  unitPrice: 550, unit: 'unit' },
        { id: 'l3-desk',  name: 'Standing Desk',    unitPrice: 800, unit: 'unit' },
        { id: 'l3-shelf', name: 'Bookshelf',        unitPrice: 200, unit: 'unit' },
      ]},
      { id: 'l2-equip', name: 'Equipment', children: [
        { id: 'l3-proj',   name: 'Projector',       unitPrice: 1200, unit: 'unit' },
        { id: 'l3-camera', name: 'Webcam HD',       unitPrice: 150,  unit: 'unit' },
        { id: 'l3-headset',name: 'Headset',         unitPrice: 95,   unit: 'unit' },
      ]},
    ],
  },
  {
    id: 'l1-train', name: 'Training & Education',
    children: [
      { id: 'l2-course', name: 'Courses', children: [
        { id: 'l3-online', name: 'Online Course (per seat)', unitPrice: 200, unit: 'seat'    },
        { id: 'l3-cert',   name: 'Certification Exam',       unitPrice: 350, unit: 'person'  },
      ]},
      { id: 'l2-event', name: 'Events & Seminars', children: [
        { id: 'l3-seminar', name: 'Seminar Ticket',         unitPrice: 120, unit: 'person'  },
        { id: 'l3-conf',    name: 'Conference Registration', unitPrice: 500, unit: 'person' },
      ]},
    ],
  },
]

export const APPROVAL_TYPES = [
  {
    id: 'ap-standard',
    name: 'Standard Purchase',
    description: 'General purchases and operational expenses',
    steps: [
      { role: 'Line Manager',    personInCharge: 'Somchai Kongchai'  },
      { role: 'Finance Manager', personInCharge: 'Nipa Thongchai'    },
      { role: 'Director',        personInCharge: 'Somchai Kongchai'  },
    ],
  },
  {
    id: 'ap-it',
    name: 'IT Purchase',
    description: 'Hardware, software licenses, and cloud services',
    steps: [
      { role: 'IT Manager',      personInCharge: 'Dara Sopheak'      },
      { role: 'Finance Manager', personInCharge: 'Nipa Thongchai'    },
      { role: 'Director',        personInCharge: 'Somchai Kongchai'  },
    ],
  },
  {
    id: 'ap-marketing',
    name: 'Marketing Purchase',
    description: 'Campaigns, print materials, and branding',
    steps: [
      { role: 'Marketing Lead',  personInCharge: 'Nipa Thongchai'    },
      { role: 'Finance Manager', personInCharge: 'Nipa Thongchai'    },
      { role: 'Director',        personInCharge: 'Somchai Kongchai'  },
    ],
  },
  {
    id: 'ap-emergency',
    name: 'Emergency Purchase',
    description: 'Urgent items that require fast-track approval',
    steps: [
      { role: 'Finance Manager', personInCharge: 'Nipa Thongchai'    },
      { role: 'Director',        personInCharge: 'Somchai Kongchai'  },
    ],
  },
  {
    id: 'ap-small',
    name: 'Small Amount',
    description: 'Low-value items with streamlined single-step approval',
    steps: [
      { role: 'Line Manager',    personInCharge: 'Somchai Kongchai'  },
    ],
  },
]

export const MOCK_CATEGORIES = [
  { id: 'cat-1', name: 'Angkor Office Supplies Co., Ltd', color: '#1E3A8A', icon: 'Package',       personInCharge: 'Somchai Kongchai', remark: 'Main stationery & office goods vendor' },
  { id: 'cat-2', name: 'CamAir Travel Services',          color: '#0891B2', icon: 'Plane',         personInCharge: 'Nipa Thongchai',   remark: 'Domestic & international flight booking' },
  { id: 'cat-3', name: 'Golden Kitchen & Events',         color: '#D97706', icon: 'Utensils',      personInCharge: 'Boonsri Malee',    remark: 'Catering, team meals, client entertainment' },
  { id: 'cat-4', name: 'Mekong Tech Solutions',           color: '#7C3AED', icon: 'Monitor',       personInCharge: 'Dara Sopheak',     remark: 'IT hardware, software licenses & cloud' },
  { id: 'cat-5', name: 'Royal Media Group',               color: '#DB2777', icon: 'Megaphone',     personInCharge: 'Nipa Thongchai',   remark: 'Marketing, advertising & branding' },
  { id: 'cat-6', name: 'Phnom Penh Furniture Co., Ltd',   color: '#059669', icon: 'Armchair',      personInCharge: 'Somchai Kongchai', remark: 'Office furniture & equipment supplier' },
  { id: 'cat-7', name: 'Bayon Learning Center',           color: '#EA580C', icon: 'GraduationCap', personInCharge: 'Dara Sopheak',     remark: 'Training courses, certifications, seminars' },
]

export const MOCK_ORG = {
  id: 'u0',
  name: 'Somchai Kongchai',
  role: 'Owner / CEO',
  department: 'Management',
  status: 'active',
  children: [
    {
      id: 'u1',
      name: 'Nipa Thongchai',
      role: 'Finance Manager',
      department: 'Finance',
      status: 'active',
      children: [
        { id: 'u4', name: 'Boonsri Malee', role: 'Finance Staff', department: 'Finance', status: 'active', children: [] },
      ],
    },
    {
      id: 'u2',
      name: 'Tech Corp Ltd',
      role: 'Operations Manager',
      department: 'Operations',
      status: 'active',
      children: [
        { id: 'u5', name: 'Arisa Pattana', role: 'Operations Staff', department: 'Operations', status: 'active', children: [] },
        { id: 'u6', name: 'Krit Namsai',   role: 'Operations Staff', department: 'Operations', status: 'inactive', children: [] },
      ],
    },
    {
      id: 'u3',
      name: 'Dara Sopheak',
      role: 'IT Manager',
      department: 'IT',
      status: 'active',
      children: [],
    },
  ],
}
