import { create } from 'zustand'
import { BUDGET_TREE, MOCK_REQUESTS, APPROVAL_TYPES } from '../lib/mockData'

function resolveInvoiceStatus(status, dueDate) {
  if (status === 'paid' || status === 'cancelled') return status
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate); due.setHours(0, 0, 0, 0)
  if (today > due && status === 'progress') return 'overdue'
  return status
}

// ─── Seed Data ───────────────────────────────────────────────────────────────

const MASTER_SERVICES_INIT = [
  { id: 'water',   name: 'Water',        type: 'utility', icon: 'Droplets',     defaultRate: 0.28, unitLabel: '$/m³',  canDelete: false },
  { id: 'elec',    name: 'Electricity',  type: 'utility', icon: 'Zap',          defaultRate: 0.12, unitLabel: '$/kWh', canDelete: false },
  { id: 'parking', name: 'Parking',      type: 'fixed',   icon: 'ParkingSquare',defaultRate: 50,   unitLabel: '$/mo',  canDelete: true  },
  { id: 'wifi',    name: 'WiFi',         type: 'fixed',   icon: 'Wifi',         defaultRate: 30,   unitLabel: '$/mo',  canDelete: true  },
  { id: 'cleaning',name: 'Cleaning',     type: 'fixed',   icon: 'Brush',        defaultRate: 20,   unitLabel: '$/mo',  canDelete: true  },
  { id: 'laundry', name: 'Laundry',      type: 'fixed',   icon: 'Shirt',        defaultRate: 15,   unitLabel: '$/mo',  canDelete: true  },
  { id: 'storage', name: 'Storage Unit', type: 'fixed',   icon: 'Package',      defaultRate: 35,   unitLabel: '$/mo',  canDelete: true  },
  { id: 'pet',     name: 'Pet Fee',      type: 'fixed',   icon: 'PawPrint',     defaultRate: 25,   unitLabel: '$/mo',  canDelete: true  },
]

const BUILDINGS_INIT = [
  { id: 'bldg-a', name: 'Block A', remark: 'Main residential block' },
  { id: 'bldg-b', name: 'Block B', remark: 'East wing' },
  { id: 'bldg-c', name: 'Block C', remark: 'North annex' },
]

const FLOORS_INIT = [
  { id: 'fl-a1', buildingId: 'bldg-a', name: 'Floor 1', remark: 'Near entrance' },
  { id: 'fl-a2', buildingId: 'bldg-a', name: 'Floor 2', remark: '' },
  { id: 'fl-b1', buildingId: 'bldg-b', name: 'Floor 1', remark: '' },
  { id: 'fl-c1', buildingId: 'bldg-c', name: 'Floor 1', remark: '' },
]

const ROOMS_INIT = [
  { id: '101', floorId: 'fl-a1', buildingId: 'bldg-a', name: 'Room 101', size: '28 sqm', price: 650 },
  { id: '102', floorId: 'fl-a1', buildingId: 'bldg-a', name: 'Room 102', size: '32 sqm', price: 700 },
  { id: '201', floorId: 'fl-a2', buildingId: 'bldg-a', name: 'Room 201', size: '45 sqm', price: 900 },
  { id: '202', floorId: 'fl-a2', buildingId: 'bldg-a', name: 'Room 202', size: '28 sqm', price: 650 },
  { id: 'B101', floorId: 'fl-b1', buildingId: 'bldg-b', name: 'Room B101', size: '30 sqm', price: 680 },
]

const TENANTS_INIT = [
  { id: 't1', name: 'Somchai Kongchai',  phone: '081-234-5678', photo: null, status: 'active' },
  { id: 't2', name: 'Nipa Thongchai',    phone: '089-876-5432', photo: null, status: 'active' },
  { id: 't3', name: 'Tech Corp Ltd',     phone: '02-111-2222',  photo: null, status: 'active' },
  { id: 't4', name: 'Boonsri Malee',     phone: '090-111-2222', photo: null, status: 'inactive' },
]

const CONTRACTS_INIT = [
  { id: 'c1', roomId: '101', tenantId: 't1', startDate: '2025-01-01', endDate: null, baseRent: 650, securityDeposit: 1300, status: 'active' },
  { id: 'c2', roomId: '102', tenantId: 't2', startDate: '2024-06-01', endDate: null, baseRent: 700, securityDeposit: 1400, status: 'active' },
  { id: 'c3', roomId: '201', tenantId: 't3', startDate: '2024-03-01', endDate: null, baseRent: 900, securityDeposit: 1800, status: 'active' },
]

const ROOM_SERVICES_INIT = [
  { id: 'rs1',  roomId: '101', serviceId: 'water',   enabled: true,  priceOverride: null },
  { id: 'rs2',  roomId: '101', serviceId: 'elec',    enabled: true,  priceOverride: null },
  { id: 'rs3',  roomId: '101', serviceId: 'parking', enabled: true,  priceOverride: null },
  { id: 'rs4',  roomId: '101', serviceId: 'wifi',    enabled: true,  priceOverride: null },
  { id: 'rs5',  roomId: '102', serviceId: 'water',   enabled: true,  priceOverride: null },
  { id: 'rs6',  roomId: '102', serviceId: 'elec',    enabled: true,  priceOverride: null },
  { id: 'rs7',  roomId: '102', serviceId: 'parking', enabled: true,  priceOverride: null },
  { id: 'rs8',  roomId: '201', serviceId: 'water',   enabled: true,  priceOverride: null },
  { id: 'rs9',  roomId: '201', serviceId: 'elec',    enabled: true,  priceOverride: null },
  { id: 'rs10', roomId: '201', serviceId: 'wifi',    enabled: true,  priceOverride: null },
]

// Meter readings: each record = one session (date + recorder) with water + elec entries
const METER_READINGS_INIT = [
  {
    id: 'mr1', roomId: '101', date: '2026-03-11', recorder: 'Somchai (Manager)',
    waterPrev: 1240, waterCurrent: 1268,
    elecPrev: 3850,  elecCurrent: 3920,
  },
  {
    id: 'mr2', roomId: '101', date: '2026-02-08', recorder: 'Narak (Staff)',
    waterPrev: 1215, waterCurrent: 1240,
    elecPrev: 3790,  elecCurrent: 3850,
  },
  {
    id: 'mr3', roomId: '101', date: '2026-01-10', recorder: 'Somchai (Manager)',
    waterPrev: 1190, waterCurrent: 1215,
    elecPrev: 3730,  elecCurrent: 3790,
  },
  {
    id: 'mr4', roomId: '102', date: '2026-03-11', recorder: 'Somchai (Manager)',
    waterPrev: 820, waterCurrent: 848,
    elecPrev: 2100, elecCurrent: 2165,
  },
  {
    id: 'mr5', roomId: '201', date: '2026-03-09', recorder: 'Narak (Staff)',
    waterPrev: 560, waterCurrent: 588,
    elecPrev: 4200, elecCurrent: 4290,
  },
]

const INVOICES_INIT = [
  // Room 101 — Feb 2026, Paid
  {
    id: 'INV-2026-02-101',
    roomId: '101',
    contractId: 'c1',
    tenantSnapshot: { name: 'Somchai Kongchai', phone: '081-234-5678' },
    roomSnapshot: { name: 'Room 101', building: 'Block A', floor: 'Floor 1' },
    periodStart: '2026-02-01',
    periodEnd: '2026-02-28',
    dueDate: '2026-02-15',
    status: 'paid',
    baseRent: 650,
    waterPrev: 1215, waterCurrent: 1240, waterRate: 0.28,
    elecPrev: 3790,  elecCurrent: 3850,  elecRate: 0.12,
    fixedServices: [
      { serviceId: 'parking', name: 'Parking', amount: 50 },
      { serviceId: 'wifi',    name: 'WiFi',    amount: 30 },
    ],
    securityDeposit: 1300,
    subtotal: 744.20,
    total: 744.20,
    exchangeRate: 4000,
    paymentMethod: 'Cash',
    paidAt: '2026-02-12T09:30:00',
    cancelReason: null,
    cancelledAt: null,
  },
  // Room 101 — Jan 2026, Paid
  {
    id: 'INV-2026-01-101',
    roomId: '101',
    contractId: 'c1',
    tenantSnapshot: { name: 'Somchai Kongchai', phone: '081-234-5678' },
    roomSnapshot: { name: 'Room 101', building: 'Block A', floor: 'Floor 1' },
    periodStart: '2026-01-01',
    periodEnd: '2026-01-31',
    dueDate: '2026-01-15',
    status: 'paid',
    baseRent: 650,
    waterPrev: 1190, waterCurrent: 1215, waterRate: 0.28,
    elecPrev: 3730,  elecCurrent: 3790,  elecRate: 0.12,
    fixedServices: [
      { serviceId: 'parking', name: 'Parking', amount: 50 },
      { serviceId: 'wifi',    name: 'WiFi',    amount: 30 },
    ],
    securityDeposit: 1300,
    subtotal: 742.20,
    total: 742.20,
    exchangeRate: 4000,
    paymentMethod: 'QR Transfer',
    paidAt: '2026-01-10T14:00:00',
    cancelReason: null,
    cancelledAt: null,
  },
  // Room 101 — Dec 2025, Overdue
  {
    id: 'INV-2025-12-101',
    roomId: '101',
    contractId: 'c1',
    tenantSnapshot: { name: 'Somchai Kongchai', phone: '081-234-5678' },
    roomSnapshot: { name: 'Room 101', building: 'Block A', floor: 'Floor 1' },
    periodStart: '2025-12-01',
    periodEnd: '2025-12-31',
    dueDate: '2025-12-15',
    status: 'overdue',
    baseRent: 650,
    waterPrev: 1165, waterCurrent: 1190, waterRate: 0.28,
    elecPrev: 3670,  elecCurrent: 3730,  elecRate: 0.12,
    fixedServices: [
      { serviceId: 'parking', name: 'Parking', amount: 50 },
      { serviceId: 'wifi',    name: 'WiFi',    amount: 30 },
    ],
    securityDeposit: 1300,
    subtotal: 744.20,
    total: 744.20,
    exchangeRate: 4000,
    paymentMethod: null,
    paidAt: null,
    cancelReason: null,
    cancelledAt: null,
  },
  // Room 101 — Nov 2025, Paid
  {
    id: 'INV-2025-11-101',
    roomId: '101',
    contractId: 'c1',
    tenantSnapshot: { name: 'Somchai Kongchai', phone: '081-234-5678' },
    roomSnapshot: { name: 'Room 101', building: 'Block A', floor: 'Floor 1' },
    periodStart: '2025-11-01',
    periodEnd: '2025-11-30',
    dueDate: '2025-11-15',
    status: 'paid',
    baseRent: 650,
    waterPrev: 1140, waterCurrent: 1165, waterRate: 0.28,
    elecPrev: 3610,  elecCurrent: 3670,  elecRate: 0.12,
    fixedServices: [
      { serviceId: 'parking', name: 'Parking', amount: 50 },
      { serviceId: 'wifi',    name: 'WiFi',    amount: 30 },
    ],
    securityDeposit: 1300,
    subtotal: 744.20,
    total: 744.20,
    exchangeRate: 4000,
    paymentMethod: 'Cash',
    paidAt: '2025-11-09T11:00:00',
    cancelReason: null,
    cancelledAt: null,
  },
  // Room 101 — Mar 2026, In Progress
  {
    id: 'INV-2026-03-101',
    roomId: '101',
    contractId: 'c1',
    tenantSnapshot: { name: 'Somchai Kongchai', phone: '081-234-5678' },
    roomSnapshot: { name: 'Room 101', building: 'Block A', floor: 'Floor 1' },
    periodStart: '2026-03-01',
    periodEnd: '2026-03-31',
    dueDate: '2026-04-07',
    status: 'progress',
    baseRent: 650,
    waterPrev: 1268, waterCurrent: 1298, waterRate: 0.28,
    elecPrev: 3920,  elecCurrent: 3998,  elecRate: 0.12,
    fixedServices: [
      { serviceId: 'parking', name: 'Parking', amount: 50 },
      { serviceId: 'wifi',    name: 'WiFi',    amount: 30 },
    ],
    securityDeposit: 1300,
    subtotal: 747.76,
    total: 747.76,
    exchangeRate: 4000,
    paymentMethod: null,
    paidAt: null,
    cancelReason: null,
    cancelledAt: null,
  },
  // Room 102 — Feb 2026, In Progress
  {
    id: 'INV-2026-02-102',
    roomId: '102',
    contractId: 'c2',
    tenantSnapshot: { name: 'Nipa Thongchai', phone: '089-876-5432' },
    roomSnapshot: { name: 'Room 102', building: 'Block A', floor: 'Floor 1' },
    periodStart: '2026-02-01',
    periodEnd: '2026-02-28',
    dueDate: '2026-03-07',
    status: 'progress',
    baseRent: 700,
    waterPrev: 795, waterCurrent: 820, waterRate: 0.28,
    elecPrev: 2040, elecCurrent: 2100, elecRate: 0.12,
    fixedServices: [
      { serviceId: 'parking', name: 'Parking', amount: 50 },
    ],
    securityDeposit: 1400,
    subtotal: 764.20,
    total: 764.20,
    exchangeRate: 4000,
    paymentMethod: null,
    paidAt: null,
    cancelReason: null,
    cancelledAt: null,
  },
  // Room 102 — Mar 2026, In Progress
  {
    id: 'INV-2026-03-102',
    roomId: '102',
    contractId: 'c2',
    tenantSnapshot: { name: 'Nipa Thongchai', phone: '089-876-5432' },
    roomSnapshot: { name: 'Room 102', building: 'Block A', floor: 'Floor 1' },
    periodStart: '2026-03-01',
    periodEnd: '2026-03-31',
    dueDate: '2026-04-07',
    status: 'progress',
    baseRent: 700,
    waterPrev: 848, waterCurrent: 878, waterRate: 0.28,
    elecPrev: 2165, elecCurrent: 2230, elecRate: 0.12,
    fixedServices: [
      { serviceId: 'parking', name: 'Parking', amount: 50 },
    ],
    securityDeposit: 1400,
    subtotal: 766.20,
    total: 766.20,
    exchangeRate: 4000,
    paymentMethod: null,
    paidAt: null,
    cancelReason: null,
    cancelledAt: null,
  },
  // Room 201 — Mar 2026, In Progress
  {
    id: 'INV-2026-03-201',
    roomId: '201',
    contractId: 'c3',
    tenantSnapshot: { name: 'Tech Corp Ltd', phone: '02-111-2222' },
    roomSnapshot: { name: 'Room 201', building: 'Block A', floor: 'Floor 2' },
    periodStart: '2026-03-01',
    periodEnd: '2026-03-31',
    dueDate: '2026-04-07',
    status: 'progress',
    baseRent: 900,
    waterPrev: 588, waterCurrent: 620, waterRate: 0.28,
    elecPrev: 4290, elecCurrent: 4385, elecRate: 0.12,
    fixedServices: [
      { serviceId: 'wifi', name: 'WiFi', amount: 30 },
    ],
    securityDeposit: 1800,
    subtotal: 950.36,
    total: 950.36,
    exchangeRate: 4000,
    paymentMethod: null,
    paidAt: null,
    cancelReason: null,
    cancelledAt: null,
  },
]

const NOTIFICATIONS_INIT = [
  { id: 'n1',  type: 'bill_started',      title: 'Bill Started',       body: 'Invoice created for Room 101 · Somchai Kongchai (Nov 2025)',       ref: 'INV-2025-11-101', read: true,  createdAt: '2025-11-01T08:00:00' },
  { id: 'n2',  type: 'invoice_paid',      title: 'Invoice Paid',       body: 'Room 101 · Somchai Kongchai paid INV-2025-11-101 via Cash',        ref: 'INV-2025-11-101', read: true,  createdAt: '2025-11-09T11:00:00' },
  { id: 'n3',  type: 'bill_started',      title: 'Bill Started',       body: 'Invoice created for Room 101 · Somchai Kongchai (Dec 2025)',       ref: 'INV-2025-12-101', read: true,  createdAt: '2025-12-01T08:00:00' },
  { id: 'n4',  type: 'invoice_overdue',   title: 'Invoice Overdue',    body: 'INV-2025-12-101 for Room 101 is past due date',                   ref: 'INV-2025-12-101', read: true,  createdAt: '2025-12-16T00:00:00' },
  { id: 'n5',  type: 'bill_started',      title: 'Bill Started',       body: 'Invoice created for Room 101 · Somchai Kongchai (Jan 2026)',       ref: 'INV-2026-01-101', read: true,  createdAt: '2026-01-01T08:00:00' },
  { id: 'n6',  type: 'invoice_paid',      title: 'Invoice Paid',       body: 'Room 101 · Somchai Kongchai paid INV-2026-01-101 via QR Transfer', ref: 'INV-2026-01-101', read: true,  createdAt: '2026-01-10T14:00:00' },
  { id: 'n7',  type: 'bill_started',      title: 'Bill Started',       body: 'Invoice created for Room 101 · Somchai Kongchai (Feb 2026)',       ref: 'INV-2026-02-101', read: true,  createdAt: '2026-02-01T08:00:00' },
  { id: 'n8',  type: 'invoice_paid',      title: 'Invoice Paid',       body: 'Room 101 · Somchai Kongchai paid INV-2026-02-101 via Cash',        ref: 'INV-2026-02-101', read: true,  createdAt: '2026-02-12T09:30:00' },
  { id: 'n9',  type: 'bill_started',      title: 'Bill Started',       body: 'Invoice created for Room 102 · Nipa Thongchai (Feb 2026)',         ref: 'INV-2026-02-102', read: true,  createdAt: '2026-02-01T08:10:00' },
  { id: 'n10', type: 'meter_recorded',    title: 'Meter Recorded',     body: 'Room 101 meter recorded by Somchai (Manager) — Water +28, Elec +70', ref: null,            read: true,  createdAt: '2026-03-11T09:00:00' },
  { id: 'n11', type: 'meter_recorded',    title: 'Meter Recorded',     body: 'Room 102 meter recorded by Somchai (Manager) — Water +28, Elec +65', ref: null,            read: true,  createdAt: '2026-03-11T09:15:00' },
  { id: 'n12', type: 'meter_recorded',    title: 'Meter Recorded',     body: 'Room 201 meter recorded by Narak (Staff) — Water +28, Elec +90',    ref: null,            read: false, createdAt: '2026-03-09T10:00:00' },
  { id: 'n13', type: 'bill_started',      title: 'Bill Started',       body: 'Invoice created for Room 101 · Somchai Kongchai (Mar 2026)',       ref: 'INV-2026-03-101', read: false, createdAt: '2026-03-24T08:00:00' },
  { id: 'n14', type: 'bill_started',      title: 'Bill Started',       body: 'Invoice created for Room 102 · Nipa Thongchai (Mar 2026)',         ref: 'INV-2026-03-102', read: false, createdAt: '2026-03-24T08:05:00' },
  { id: 'n15', type: 'bill_started',      title: 'Bill Started',       body: 'Invoice created for Room 201 · Tech Corp Ltd (Mar 2026)',          ref: 'INV-2026-03-201', read: false, createdAt: '2026-03-24T08:10:00' },
  { id: 'n16', type: 'invoice_overdue',   title: 'Invoice Overdue',    body: 'INV-2026-02-102 for Room 102 · Nipa Thongchai is past due date',  ref: 'INV-2026-02-102', read: false, createdAt: '2026-03-08T00:00:00' },
  { id: 'n17', type: 'sub_user_added',    title: 'Sub User Added',     body: 'Narak Sovan was added as Manager',                                ref: null,              read: false, createdAt: '2026-03-20T10:00:00' },
  { id: 'n18', type: 'sub_user_added',    title: 'Sub User Added',     body: 'Chanda Bopha was added as Staff',                                 ref: null,              read: false, createdAt: '2026-03-20T10:05:00' },
]

const OWNER_ACCOUNT = { phone: '099-000-0001', password: 'admin1234', name: 'System Owner', role: 'owner' }

const SUB_USERS_INIT = [
  { id: 'su1', name: 'Narak Sovan',   role: 'manager', phone: '012-111-222', password: '1234', status: 'active' },
  { id: 'su2', name: 'Chanda Bopha',  role: 'staff',   phone: '015-333-444', password: '5678', status: 'active' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useStore = create((set, get) => ({
  // ── State ──
  buildings:      [...BUILDINGS_INIT],
  floors:         [...FLOORS_INIT],
  rooms:          [...ROOMS_INIT],
  tenants:        [...TENANTS_INIT],
  contracts:      [...CONTRACTS_INIT],
  roomServices:   [...ROOM_SERVICES_INIT],
  masterServices: [...MASTER_SERVICES_INIT],
  meterReadings:  [...METER_READINGS_INIT],
  invoices:       [...INVOICES_INIT],
  exchangeRate:   4000,
  language:       'en',
  currency:       'KHR',
  budgetTree:     JSON.parse(JSON.stringify(BUDGET_TREE)),
  requests:       [...MOCK_REQUESTS],
  approvalTypes:  [...APPROVAL_TYPES],
  isLoggedIn:     false,
  authUser:       null,
  ownerProfile:   { name: OWNER_ACCOUNT.name, phone: OWNER_ACCOUNT.phone, profileImage: null, password: OWNER_ACCOUNT.password },
  subUsers:       [...SUB_USERS_INIT],
  departments:    ['Management', 'Finance', 'Operations', 'IT', 'Marketing', 'HR', 'Sales'],
  notifications:  [...NOTIFICATIONS_INIT],
  invoiceSettings: {
    header: {
      enabled: true,
      profileImage: null,
      bizName: '',
      tinNo: '',
      address: '',
      bizPhone: '',
    },
    body: {
      enabled: true,
      invoiceNoDigits: 6,
    },
    footer: {
      enabled: true,
      note: '',
    },
    qr: {
      enabled: false,
      qrImage: null,
    },
  },

  // ── Selectors ──

  /** Returns active contract for a room, or null */
  getActiveContract(roomId) {
    return get().contracts.find(c => c.roomId === roomId && c.status === 'active') || null
  },

  /** Returns room with its occupancy status, contract, and tenant */
  getRoomWithStatus(roomId) {
    const { rooms, contracts, tenants, buildings, floors } = get()
    const room = rooms.find(r => r.id === roomId)
    if (!room) return null
    const contract = contracts.find(c => c.roomId === roomId && c.status === 'active') || null
    const tenant = contract ? tenants.find(t => t.id === contract.tenantId) || null : null
    const floor = floors.find(f => f.id === room.floorId)
    const building = buildings.find(b => b.id === room.buildingId)
    return { room, contract, tenant, floor, building, occupied: !!contract }
  },

  /** All rooms with status */
  getAllRoomsWithStatus() {
    return get().rooms.map(r => get().getRoomWithStatus(r.id))
  },

  /** Resolved invoice status (auto overdue if past due) */
  resolveInvoice(inv) {
    return { ...inv, status: resolveInvoiceStatus(inv.status, inv.dueDate) }
  },

  /** Invoices for a room, with status resolved */
  getInvoicesByRoom(roomId) {
    return get().invoices
      .filter(inv => inv.roomId === roomId)
      .map(inv => get().resolveInvoice(inv))
      .sort((a, b) => new Date(b.periodStart) - new Date(a.periodStart))
  },

  /** All invoices resolved */
  getAllInvoices() {
    return get().invoices
      .map(inv => get().resolveInvoice(inv))
      .sort((a, b) => new Date(b.periodStart) - new Date(a.periodStart))
  },

  /** Single invoice by id, resolved */
  getInvoiceById(id) {
    const inv = get().invoices.find(i => i.id === id)
    return inv ? get().resolveInvoice(inv) : null
  },

  /** Active services for a room with resolved rates */
  getRoomServices(roomId) {
    const { roomServices, masterServices } = get()
    return roomServices
      .filter(rs => rs.roomId === roomId && rs.enabled)
      .map(rs => {
        const master = masterServices.find(m => m.id === rs.serviceId)
        return {
          ...rs,
          name: master?.name || rs.serviceId,
          icon: master?.icon || 'Box',
          type: master?.type || 'fixed',
          unitLabel: master?.unitLabel || '$/mo',
          effectiveRate: rs.priceOverride != null ? rs.priceOverride : (master?.defaultRate || 0),
          defaultRate: master?.defaultRate || 0,
        }
      })
  },

  /** Latest meter reading for a room */
  getLastMeterReading(roomId) {
    const readings = get().meterReadings
      .filter(r => r.roomId === roomId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
    return readings[0] || null
  },

  /** Meter readings for a room sorted newest first */
  getMeterReadings(roomId) {
    return get().meterReadings
      .filter(r => r.roomId === roomId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  },

  /** Rooms linked to a tenant (via active contracts) */
  getTenantRooms(tenantId) {
    const { contracts } = get()
    return contracts
      .filter(c => c.tenantId === tenantId)
      .map(c => ({ ...get().getRoomWithStatus(c.roomId), contract: c }))
  },

  // ── Building / Floor / Room CRUD ──

  addBuilding(data) {
    const building = { id: 'bldg-' + uid(), ...data }
    set(s => ({ buildings: [...s.buildings, building] }))
    return building
  },

  updateBuilding(id, data) {
    set(s => ({ buildings: s.buildings.map(b => b.id === id ? { ...b, ...data } : b) }))
  },

  deleteBuilding(id) {
    const { contracts, rooms } = get()
    const buildingRooms = rooms.filter(r => r.buildingId === id).map(r => r.id)
    const hasActive = contracts.some(c => buildingRooms.includes(c.roomId) && c.status === 'active')
    if (hasActive) return { error: 'Cannot delete building with active tenant contracts.' }
    set(s => ({
      buildings: s.buildings.filter(b => b.id !== id),
      floors: s.floors.filter(f => f.buildingId !== id),
      rooms: s.rooms.filter(r => r.buildingId !== id),
    }))
    return { error: null }
  },

  addFloor(data) {
    const floor = { id: 'fl-' + uid(), ...data }
    set(s => ({ floors: [...s.floors, floor] }))
    return floor
  },

  updateFloor(id, data) {
    set(s => ({ floors: s.floors.map(f => f.id === id ? { ...f, ...data } : f) }))
  },

  deleteFloor(id) {
    const { contracts, rooms } = get()
    const floorRooms = rooms.filter(r => r.floorId === id).map(r => r.id)
    const hasActive = contracts.some(c => floorRooms.includes(c.roomId) && c.status === 'active')
    if (hasActive) return { error: 'Cannot delete floor with active tenant contracts.' }
    set(s => ({
      floors: s.floors.filter(f => f.id !== id),
      rooms: s.rooms.filter(r => r.floorId !== id),
    }))
    return { error: null }
  },

  addRoom(data) {
    const room = { id: uid(), ...data }
    set(s => ({ rooms: [...s.rooms, room] }))
    return room
  },

  updateRoom(id, data) {
    set(s => ({ rooms: s.rooms.map(r => r.id === id ? { ...r, ...data } : r) }))
  },

  deleteRoom(id) {
    const { contracts } = get()
    const hasActive = contracts.some(c => c.roomId === id && c.status === 'active')
    if (hasActive) return { error: 'Cannot delete room with an active contract. Terminate tenant first.' }
    set(s => ({ rooms: s.rooms.filter(r => r.id !== id) }))
    return { error: null }
  },

  // ── Tenant Management ──

  addTenant(data) {
    const existing = get().tenants.find(t => t.phone === data.phone)
    if (existing) return existing
    const tenant = { id: 't' + uid(), status: 'active', photo: null, ...data }
    set(s => ({ tenants: [...s.tenants, tenant] }))
    return tenant
  },

  updateTenant(id, data) {
    set(s => ({ tenants: s.tenants.map(t => t.id === id ? { ...t, ...data } : t) }))
  },

  lookupTenantByPhone(phone) {
    return get().tenants.find(t => t.phone === phone.trim()) || null
  },

  /** Assign tenant to room: creates contract + marks services */
  addTenantToRoom(roomId, tenantId, contractData, selectedServiceIds) {
    const contract = {
      id: 'c' + uid(),
      roomId,
      tenantId,
      status: 'active',
      ...contractData,
    }
    const newRoomServices = selectedServiceIds.map(sid => ({
      id: 'rs' + uid(), roomId, serviceId: sid, enabled: true, priceOverride: null
    }))
    set(s => ({
      contracts: [...s.contracts, contract],
      roomServices: [
        ...s.roomServices.filter(rs => rs.roomId !== roomId),
        ...newRoomServices,
      ],
    }))
    return contract
  },

  /** Terminate contract (remove tenant) */
  removeTenantFromRoom(contractId, reason) {
    set(s => ({
      contracts: s.contracts.map(c =>
        c.id === contractId ? { ...c, status: 'terminated', terminationReason: reason, terminatedAt: new Date().toISOString() } : c
      ),
    }))
  },

  /** Update contract fields inline */
  updateContract(contractId, data) {
    set(s => ({
      contracts: s.contracts.map(c => c.id === contractId ? { ...c, ...data } : c)
    }))
  },

  // ── Room Services ──

  /** Bulk update room services (from Add Service modal) */
  setRoomServices(roomId, services) {
    const newEntries = services.map(s => ({
      id: get().roomServices.find(rs => rs.roomId === roomId && rs.serviceId === s.serviceId)?.id || ('rs' + uid()),
      roomId,
      serviceId: s.serviceId,
      enabled: s.enabled,
      priceOverride: s.priceOverride != null ? parseFloat(s.priceOverride) : null,
    }))
    set(s => ({
      roomServices: [
        ...s.roomServices.filter(rs => rs.roomId !== roomId),
        ...newEntries,
      ]
    }))
  },

  // ── Meter Readings ──

  addMeterReading(reading) {
    const entry = { id: 'mr' + uid(), ...reading }
    set(s => ({ meterReadings: [...s.meterReadings, entry] }))
    const room = get().rooms.find(r => r.id === reading.roomId)
    const wUsage = (reading.waterCurrent || 0) - (reading.waterPrev || 0)
    const eUsage = (reading.elecCurrent  || 0) - (reading.elecPrev  || 0)
    get().addNotification({
      type: 'meter_recorded',
      title: 'Meter Recorded',
      body: `${room?.name || reading.roomId} meter recorded by ${reading.recorder} — Water +${wUsage}, Elec +${eUsage}`,
    })
    return entry
  },

  // ── Invoices ──

  createInvoice(data) {
    const invoice = {
      id: data.id || 'INV-' + uid(),
      status: 'progress',
      paymentMethod: null,
      paidAt: null,
      cancelReason: null,
      cancelledAt: null,
      ...data,
    }
    set(s => ({ invoices: [...s.invoices, invoice] }))
    const period = new Date(data.periodStart).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    get().addNotification({
      type: 'bill_started',
      title: 'Bill Started',
      body: `Invoice created for ${data.roomSnapshot?.name} · ${data.tenantSnapshot?.name} (${period})`,
      ref: invoice.id,
    })
    return invoice
  },

  markInvoicePaid(invoiceId, method) {
    set(s => ({
      invoices: s.invoices.map(inv =>
        inv.id === invoiceId
          ? { ...inv, status: 'paid', paymentMethod: method, paidAt: new Date().toISOString() }
          : inv
      )
    }))
    const inv = get().invoices.find(i => i.id === invoiceId)
    get().addNotification({
      type: 'invoice_paid',
      title: 'Invoice Paid',
      body: `${inv?.roomSnapshot?.name} · ${inv?.tenantSnapshot?.name} paid ${invoiceId} via ${method}`,
      ref: invoiceId,
    })
  },

  cancelInvoice(invoiceId, reason) {
    set(s => ({
      invoices: s.invoices.map(inv =>
        inv.id === invoiceId
          ? { ...inv, status: 'cancelled', cancelReason: reason, cancelledAt: new Date().toISOString() }
          : inv
      )
    }))
    const inv = get().invoices.find(i => i.id === invoiceId)
    get().addNotification({
      type: 'invoice_cancelled',
      title: 'Invoice Cancelled',
      body: `${invoiceId} for ${inv?.roomSnapshot?.name} was cancelled${reason ? ` — ${reason}` : ''}`,
      ref: invoiceId,
    })
  },

  flagOverdueInvoices() {
    const { invoices, notifications } = get()
    const now = new Date()
    invoices.forEach(inv => {
      if (inv.status === 'progress' && new Date(inv.dueDate) < now) {
        const alreadyFlagged = notifications.some(n => n.type === 'invoice_overdue' && n.ref === inv.id)
        if (!alreadyFlagged) {
          get().addNotification({
            type: 'invoice_overdue',
            title: 'Invoice Overdue',
            body: `${inv.id} for ${inv.roomSnapshot?.name} · ${inv.tenantSnapshot?.name} is past due date`,
            ref: inv.id,
          })
        }
      }
    })
  },

  // ── Master Services ──

  addMasterService(data) {
    const service = { id: uid(), canDelete: true, ...data }
    set(s => ({ masterServices: [...s.masterServices, service] }))
    get().addNotification({
      type: 'service_added',
      title: 'Service Added',
      body: `New service "${data.name}" added at $${data.defaultRate}${data.unitLabel?.replace('$', '') || '/mo'}`,
    })
    return service
  },

  updateMasterService(id, data) {
    const prev = get().masterServices.find(m => m.id === id)
    set(s => ({
      masterServices: s.masterServices.map(m => m.id === id ? { ...m, ...data } : m)
    }))
    get().addNotification({
      type: 'service_edited',
      title: 'Service Updated',
      body: `Service "${data.name || prev?.name}" was updated`,
    })
  },

  deleteMasterService(id) {
    const inUse = get().roomServices.some(rs => rs.serviceId === id && rs.enabled)
    if (inUse) return { error: 'This service is currently active in one or more rooms.', warn: true }
    set(s => ({
      masterServices: s.masterServices.filter(m => m.id !== id),
      roomServices: s.roomServices.filter(rs => rs.serviceId !== id),
    }))
    return { error: null }
  },

  // ── Settings ──

  updateExchangeRate(rate) {
    set({ exchangeRate: rate })
  },

  setLanguage(lang) {
    set({ language: lang })
  },

  setCurrency(currency) {
    set({ currency })
  },

  // ── Budget Tree ──

  importBudgetYear(year, nodes) {
    // Replace all L1 nodes for this year with the new nodes, keep other years intact
    set(s => ({
      budgetTree: [
        ...s.budgetTree.filter(n => (n.year || 2026) !== year),
        ...nodes,
      ]
    }))
  },

  addBudgetL1({ name, code }) {
    set(s => ({ budgetTree: [...s.budgetTree, { code, name, children: [] }] }))
  },

  addBudgetL2(l1Code, { name, code }) {
    set(s => ({
      budgetTree: s.budgetTree.map(l1 =>
        l1.code === l1Code
          ? { ...l1, children: [...l1.children, { code, name, children: [] }] }
          : l1
      ),
    }))
  },

  addBudgetL3(l1Code, l2Code, { name, code, budgeted }) {
    set(s => ({
      budgetTree: s.budgetTree.map(l1 =>
        l1.code !== l1Code ? l1 : {
          ...l1,
          children: l1.children.map(l2 =>
            l2.code !== l2Code ? l2 : {
              ...l2,
              children: [...l2.children, { code, name, budgeted, spent: 0 }],
            }
          ),
        }
      ),
    }))
  },

  deductBudgetSpent(l3Code, amount) {
    set(s => ({
      budgetTree: s.budgetTree.map(l1 => ({
        ...l1,
        children: l1.children.map(l2 => ({
          ...l2,
          children: l2.children.map(l3 =>
            l3.code === l3Code
              ? { ...l3, spent: Math.min(l3.spent + amount, l3.budgeted) }
              : l3
          ),
        })),
      })),
    }))
  },

  // ── Requests ──

  submitRequest(req) {
    set(s => ({ requests: [req, ...s.requests] }))
  },

  approveRequest(id) {
    const { requests, deductBudgetSpent } = get()
    const req = requests.find(r => r.id === id)
    if (!req) return
    // Deduct budget for each line item
    if (req.items) {
      req.items.forEach(item => {
        if (item.budgetCode && item.amount) {
          deductBudgetSpent(item.budgetCode, item.amount)
        }
      })
    }
    set(s => ({
      requests: s.requests.map(r => r.id === id ? { ...r, status: 'approved' } : r),
    }))
  },

  rejectRequest(id) {
    set(s => ({
      requests: s.requests.map(r => r.id === id ? { ...r, status: 'rejected' } : r),
    }))
  },

  // ── Sub Users ──

  // ── Auth ──

  loginWithCredentials(phone, password) {
    const { ownerProfile } = get()
    // Check owner account (uses live ownerProfile password)
    if (phone === ownerProfile.phone && password === ownerProfile.password) {
      set({ isLoggedIn: true, authUser: { name: ownerProfile.name, phone: ownerProfile.phone, profileImage: ownerProfile.profileImage, role: 'owner', via: 'credentials', subUserId: null } })
      return { success: true }
    }
    // Check sub users
    const user = get().subUsers.find(u => u.phone === phone && u.password === password && u.status === 'active')
    if (user) {
      set({ isLoggedIn: true, authUser: { name: user.name, phone: user.phone, profileImage: user.profileImage || null, role: user.role, via: 'credentials', subUserId: user.id } })
      return { success: true }
    }
    return { success: false, error: 'Incorrect phone number or password.' }
  },

  loginWithTelegram() {
    const tg = window.Telegram?.WebApp
    const tgUser = tg?.initDataUnsafe?.user
    const name = tgUser ? `${tgUser.first_name}${tgUser.last_name ? ' ' + tgUser.last_name : ''}` : 'Telegram User'
    set({ isLoggedIn: true, authUser: { name, phone: '', profileImage: null, role: 'owner', via: 'telegram', subUserId: null } })
  },

  logout() {
    set({ isLoggedIn: false, authUser: null })
  },

  updateAuthProfile({ name, phone, profileImage }) {
    const { authUser } = get()
    if (!authUser) return
    const updated = { ...authUser, name, phone, profileImage }
    set({ authUser: updated })
    if (authUser.subUserId) {
      // Sub user — persist back to subUsers list
      set(s => ({
        subUsers: s.subUsers.map(u => u.id === authUser.subUserId ? { ...u, name, phone, profileImage } : u)
      }))
    } else {
      // Owner — persist to ownerProfile
      set(s => ({ ownerProfile: { ...s.ownerProfile, name, phone, profileImage } }))
    }
  },

  changeAuthPassword(currentPassword, newPassword) {
    const { authUser, ownerProfile } = get()
    if (!authUser) return { success: false, error: 'Not logged in.' }
    if (authUser.subUserId) {
      const user = get().subUsers.find(u => u.id === authUser.subUserId)
      if (!user || user.password !== currentPassword) return { success: false, error: 'Current password is incorrect.' }
      set(s => ({ subUsers: s.subUsers.map(u => u.id === authUser.subUserId ? { ...u, password: newPassword } : u) }))
    } else {
      if (ownerProfile.password !== currentPassword) return { success: false, error: 'Current password is incorrect.' }
      set(s => ({ ownerProfile: { ...s.ownerProfile, password: newPassword } }))
    }
    return { success: true }
  },

  changePassword(currentPassword, newPassword) {
    const { authUser, ownerProfile, subUsers } = get()
    if (authUser?.role === 'owner') {
      if (ownerProfile.password !== currentPassword) return { success: false, error: 'Current password is incorrect.' }
      set(s => ({ ownerProfile: { ...s.ownerProfile, password: newPassword } }))
    } else {
      const user = subUsers.find(u => u.id === authUser?.subUserId)
      if (!user || user.password !== currentPassword) return { success: false, error: 'Current password is incorrect.' }
      set(s => ({ subUsers: s.subUsers.map(u => u.id === user.id ? { ...u, password: newPassword } : u) }))
    }
    return { success: true }
  },

  addApprovalType(data) {
    const type = { id: 'ap' + uid(), ...data }
    set(s => ({ approvalTypes: [...s.approvalTypes, type] }))
    return type
  },

  updateApprovalType(id, data) {
    set(s => ({
      approvalTypes: s.approvalTypes.map(t => t.id === id ? { ...t, ...data } : t)
    }))
  },

  deleteApprovalType(id) {
    set(s => ({ approvalTypes: s.approvalTypes.filter(t => t.id !== id) }))
  },

  addSubUser(data) {
    const user = { id: 'su' + uid(), status: 'active', ...data }
    set(s => ({ subUsers: [...s.subUsers, user] }))
    get().addNotification({
      type: 'sub_user_added',
      title: 'Sub User Added',
      body: `${data.name} was added as ${data.role?.charAt(0).toUpperCase() + data.role?.slice(1)}`,
    })
    return user
  },

  updateSubUser(id, data) {
    set(s => ({
      subUsers: s.subUsers.map(u => u.id === id ? { ...u, ...data } : u)
    }))
  },

  deleteSubUser(id) {
    set(s => ({ subUsers: s.subUsers.filter(u => u.id !== id) }))
  },

  addDepartment(name) {
    set(s => ({ departments: [...s.departments, name.trim()] }))
  },

  updateDepartment(oldName, newName) {
    set(s => ({ departments: s.departments.map(d => d === oldName ? newName.trim() : d) }))
  },

  deleteDepartment(name) {
    set(s => ({ departments: s.departments.filter(d => d !== name) }))
  },

  // ── Notifications ──

  addNotification(data) {
    const notif = { id: 'n' + uid(), read: false, createdAt: new Date().toISOString(), ref: null, ...data }
    set(s => ({ notifications: [notif, ...s.notifications] }))
  },

  markNotificationRead(id) {
    set(s => ({
      notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    }))
  },

  markAllNotificationsRead() {
    set(s => ({ notifications: s.notifications.map(n => ({ ...n, read: true })) }))
  },

  clearNotifications() {
    set({ notifications: [] })
  },

  updateInvoiceSettings(section, data) {
    set(s => ({
      invoiceSettings: {
        ...s.invoiceSettings,
        [section]: { ...s.invoiceSettings[section], ...data },
      },
    }))
  },
}))
