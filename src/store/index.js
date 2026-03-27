import { create } from 'zustand'
import { BUDGET_TREE, MOCK_REQUESTS, APPROVAL_TYPES } from '../lib/mockData'

// ─── Seed Data ───────────────────────────────────────────────────────────────

const OWNER_ACCOUNT = { phone: '099-000-0001', password: 'admin1234', name: 'System Owner', role: 'owner' }

const SUB_USERS_INIT = [
  { id: 'su1', name: 'Narak Sovan',  phone: '012-111-222', password: '1234', department: 'Management', status: 'active' },
  { id: 'su2', name: 'Chanda Bopha', phone: '015-333-444', password: '5678', department: 'Finance',    status: 'active' },
]

// ─── Helper ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useStore = create((set, get) => ({

  // ── State ──────────────────────────────────────────────────────────────────

  isLoggedIn:    false,
  authUser:      null,
  ownerProfile:  { name: OWNER_ACCOUNT.name, phone: OWNER_ACCOUNT.phone, profileImage: null, password: OWNER_ACCOUNT.password },
  subUsers:      [...SUB_USERS_INIT],
  departments:   ['Management', 'Finance', 'Operations', 'IT', 'Marketing', 'HR', 'Sales'],
  language:      'en',
  currency:      'KHR',
  requests:      [...MOCK_REQUESTS],
  approvalTypes: [...APPROVAL_TYPES],
  budgetTree:    JSON.parse(JSON.stringify(BUDGET_TREE)),
  notifications: [],

  // ── Auth ───────────────────────────────────────────────────────────────────

  loginWithCredentials(phone, password) {
    const { ownerProfile } = get()
    if (phone === ownerProfile.phone && password === ownerProfile.password) {
      set({ isLoggedIn: true, authUser: { name: ownerProfile.name, phone: ownerProfile.phone, profileImage: ownerProfile.profileImage, role: 'owner', subUserId: null } })
      return { success: true }
    }
    const user = get().subUsers.find(u => u.phone === phone && u.password === password && u.status === 'active')
    if (user) {
      set({ isLoggedIn: true, authUser: { name: user.name, phone: user.phone, profileImage: user.profileImage || null, role: 'staff', subUserId: user.id } })
      return { success: true }
    }
    return { success: false, error: 'Incorrect phone number or password.' }
  },

  loginWithTelegram() {
    const tg = window.Telegram?.WebApp
    const tgUser = tg?.initDataUnsafe?.user
    const name = tgUser ? `${tgUser.first_name}${tgUser.last_name ? ' ' + tgUser.last_name : ''}` : 'Telegram User'
    set({ isLoggedIn: true, authUser: { name, phone: '', profileImage: null, role: 'owner', subUserId: null } })
  },

  logout() {
    set({ isLoggedIn: false, authUser: null })
  },

  updateAuthProfile({ name, phone, profileImage }) {
    const { authUser } = get()
    if (!authUser) return
    set({ authUser: { ...authUser, name, phone, profileImage } })
    if (authUser.subUserId) {
      set(s => ({ subUsers: s.subUsers.map(u => u.id === authUser.subUserId ? { ...u, name, phone, profileImage } : u) }))
    } else {
      set(s => ({ ownerProfile: { ...s.ownerProfile, name, phone, profileImage } }))
    }
  },

  changePassword(currentPassword, newPassword) {
    const { authUser, ownerProfile } = get()
    if (authUser?.role === 'owner') {
      if (ownerProfile.password !== currentPassword) return { success: false, error: 'Current password is incorrect.' }
      set(s => ({ ownerProfile: { ...s.ownerProfile, password: newPassword } }))
    } else {
      const user = get().subUsers.find(u => u.id === authUser?.subUserId)
      if (!user || user.password !== currentPassword) return { success: false, error: 'Current password is incorrect.' }
      set(s => ({ subUsers: s.subUsers.map(u => u.id === user.id ? { ...u, password: newPassword } : u) }))
    }
    return { success: true }
  },

  // ── Sub Users ──────────────────────────────────────────────────────────────

  addSubUser(data) {
    const user = { id: 'su' + uid(), status: 'active', ...data }
    set(s => ({ subUsers: [...s.subUsers, user] }))
    return user
  },

  updateSubUser(id, data) {
    set(s => ({ subUsers: s.subUsers.map(u => u.id === id ? { ...u, ...data } : u) }))
  },

  deleteSubUser(id) {
    set(s => ({ subUsers: s.subUsers.filter(u => u.id !== id) }))
  },

  // ── Departments ────────────────────────────────────────────────────────────

  addDepartment(name) {
    set(s => ({ departments: [...s.departments, name.trim()] }))
  },

  updateDepartment(oldName, newName) {
    set(s => ({ departments: s.departments.map(d => d === oldName ? newName.trim() : d) }))
  },

  deleteDepartment(name) {
    set(s => ({ departments: s.departments.filter(d => d !== name) }))
  },

  // ── Requests ───────────────────────────────────────────────────────────────

  submitRequest(req) {
    set(s => ({ requests: [req, ...s.requests] }))
  },

  approveRequest(id) {
    const { requests, deductBudgetSpent } = get()
    const req = requests.find(r => r.id === id)
    if (!req) return
    if (req.items) {
      req.items.forEach(item => {
        if (item.budgetCode && item.amount) deductBudgetSpent(item.budgetCode, item.amount)
      })
    }
    set(s => ({ requests: s.requests.map(r => r.id === id ? { ...r, status: 'approved' } : r) }))
  },

  rejectRequest(id) {
    set(s => ({ requests: s.requests.map(r => r.id === id ? { ...r, status: 'rejected' } : r) }))
  },

  // ── Approval Types ─────────────────────────────────────────────────────────

  addApprovalType(data) {
    const type = { id: 'ap' + uid(), ...data }
    set(s => ({ approvalTypes: [...s.approvalTypes, type] }))
    return type
  },

  updateApprovalType(id, data) {
    set(s => ({ approvalTypes: s.approvalTypes.map(t => t.id === id ? { ...t, ...data } : t) }))
  },

  deleteApprovalType(id) {
    set(s => ({ approvalTypes: s.approvalTypes.filter(t => t.id !== id) }))
  },

  // ── Budget Tree ────────────────────────────────────────────────────────────

  importBudgetYear(year, nodes) {
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

  // ── Settings ───────────────────────────────────────────────────────────────

  setLanguage(lang) {
    set({ language: lang })
  },

  setCurrency(currency) {
    set({ currency })
  },

  // ── Notifications ──────────────────────────────────────────────────────────

  addNotification(data) {
    const notif = { id: 'n' + uid(), read: false, createdAt: new Date().toISOString(), ref: null, ...data }
    set(s => ({ notifications: [notif, ...s.notifications] }))
  },

  markNotificationRead(id) {
    set(s => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n) }))
  },

  markAllNotificationsRead() {
    set(s => ({ notifications: s.notifications.map(n => ({ ...n, read: true })) }))
  },

  clearNotifications() {
    set({ notifications: [] })
  },
}))
