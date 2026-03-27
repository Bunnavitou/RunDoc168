import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { Clock, CheckCircle, XCircle, ChevronRight, Plus, Wallet, Tag, Users } from 'lucide-react'

const CURRENCY_SYMBOLS = { USD: '$', KHR: '៛', KRW: '₩', THB: '฿', EUR: '€', JPY: '¥', SGD: 'S$', CNY: '¥' }


const MONTH_LABELS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function StatCard({ label, value, color, icon: Icon }) {
  return (
    <div className="bg-white rounded-xl border border-[#E3E5EA] p-4 flex-1 min-w-0">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div className="text-[20px] font-bold text-[#1F1F1F] leading-tight">{value}</div>
      <div className="text-[11px] text-[#707070] mt-0.5">{label}</div>
    </div>
  )
}

const NOW = new Date()

export default function Dashboard() {
  const navigate = useNavigate()
  const { authUser, requests, currency, subUsers, budgetTree } = useStore()
  const symbol = CURRENCY_SYMBOLS[currency] ?? '៛'

  const [filterYear,  setFilterYear]  = useState(NOW.getFullYear())
  const [filterMonth, setFilterMonth] = useState(NOW.getMonth() + 1)

  // Collect years available in requests, always include current year
  const availableYears = [...new Set(requests.map(r => new Date(r.date).getFullYear()))]
    .sort((a, b) => b - a)
  if (!availableYears.includes(NOW.getFullYear())) availableYears.unshift(NOW.getFullYear())

  const filteredRequests = requests.filter(r => {
    const d = new Date(r.date)
    const matchYear  = d.getFullYear() === filterYear
    const matchMonth = filterMonth === 0 || (d.getMonth() + 1) === filterMonth
    return matchYear && matchMonth
  })

  const total    = filteredRequests.length
  const pending  = filteredRequests.filter(r => r.status === 'pending').length
  const approved = filteredRequests.filter(r => r.status === 'approved').length
  const rejected = filteredRequests.filter(r => r.status === 'rejected').length
  const totalAmt = filteredRequests.reduce((s, r) => s + r.amount, 0)
  const totalUsers = subUsers.length + 1  // +1 for owner

// Top 5 expense categories by request count + total amount
  const categoryMap = filteredRequests.reduce((acc, r) => {
    const cat = r.department || 'Uncategorized'
    if (!acc[cat]) acc[cat] = { count: 0, amount: 0 }
    acc[cat].count += 1
    acc[cat].amount += r.amount
    return acc
  }, {})
  const top5Categories = Object.entries(categoryMap)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
  const maxCatCount = top5Categories[0]?.[1].count || 1

  // Top 5 budget groups (L1 nodes) for selected year — sum L3 budgeted & spent
  function sumL3(children = []) {
    let budgeted = 0, spent = 0
    for (const l2 of children) {
      for (const l3 of (l2.children || [])) {
        budgeted += l3.budgeted || 0
        spent    += l3.spent    || 0
      }
    }
    return { budgeted, spent }
  }
  const top5Budget = (budgetTree || [])
    .filter(l1 => (l1.year || 2026) === filterYear)
    .map(l1 => ({ code: l1.code, name: l1.name, ...sumL3(l1.children) }))
    .sort((a, b) => b.budgeted - a.budgeted)
    .slice(0, 5)
  const maxBudgeted = top5Budget[0]?.budgeted || 1

  const periodLabel = filterMonth === 0
    ? `${filterYear}`
    : `${MONTH_LABELS[filterMonth]} ${filterYear}`

  return (
    <div>
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3 border-b border-[#E3E5EA]">
        <div className="text-[13px] text-[#707070]">Welcome back,</div>
        <h1 className="text-[22px] font-bold text-[#1F1F1F]">{authUser?.name?.split(' ')[0] || 'User'}</h1>
      </div>

      <div className="p-4 space-y-4" style={{ paddingBottom: '96px' }}>

        {/* Quick access */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/budget')}
            className="flex-1 bg-white rounded-xl border border-[#E3E5EA] px-4 py-3.5 flex items-center gap-3 active:opacity-80 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-[#EAF0FF] flex items-center justify-center flex-shrink-0">
              <Wallet size={18} className="text-[#1A3278]" />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-[#1F1F1F]">Budget</div>
              <div className="text-[11px] text-[#707070]">Management</div>
            </div>
            <ChevronRight size={14} className="text-[#B0B0B0] ml-auto flex-shrink-0" />
          </button>
          <button
            onClick={() => navigate('/expense-category')}
            className="flex-1 bg-white rounded-xl border border-[#E3E5EA] px-4 py-3.5 flex items-center gap-3 active:opacity-80 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F3EEFF] flex items-center justify-center flex-shrink-0">
              <Tag size={18} className="text-[#6B3FA0]" />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-[#1F1F1F]">Expense</div>
              <div className="text-[11px] text-[#707070]">Category</div>
            </div>
            <ChevronRight size={14} className="text-[#B0B0B0] ml-auto flex-shrink-0" />
          </button>
        </div>

        {/* Stat cards — 4 in a row */}
        <div className="grid grid-cols-4 gap-2">
          <StatCard label="Pending"  value={pending}    color="bg-[#F59E0B]" icon={Clock}       />
          <StatCard label="Approved" value={approved}   color="bg-[#22C55E]" icon={CheckCircle} />
          <StatCard label="Rejected" value={rejected}   color="bg-[#EF4444]" icon={XCircle}     />
          <StatCard label="Users"    value={totalUsers} color="bg-[#6B3FA0]" icon={Users}        />
        </div>

        {/* Year / Month filters */}
        <div className="flex items-center gap-2">
          <select
            value={filterYear}
            onChange={e => setFilterYear(+e.target.value)}
            className="bg-white border border-[#E3E5EA] text-[#1F1F1F] text-[13px] font-bold rounded-lg px-3 py-2 outline-none appearance-none"
          >
            {availableYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            value={filterMonth}
            onChange={e => setFilterMonth(+e.target.value)}
            className="bg-white border border-[#E3E5EA] text-[#1F1F1F] text-[13px] font-bold rounded-lg px-3 py-2 outline-none appearance-none"
          >
            <option value={0}>All Months</option>
            {MONTH_LABELS.slice(1).map((label, i) => (
              <option key={i + 1} value={i + 1}>{label}</option>
            ))}
          </select>
        </div>

        {/* Budget summary card */}
        <div className="bg-[#1E3A8A] rounded-xl px-5 py-4 text-white">
          <div className="text-[12px] font-semibold opacity-75 mb-1">Total Requested · {periodLabel}</div>
          <div className="text-[32px] font-bold leading-tight">
            {symbol}{Number(totalAmt).toLocaleString('en-US')}
          </div>
          <div className="text-[12px] opacity-70 mt-1">{total} requests submitted</div>
        </div>

        {/* Top 5 expense categories */}
        {top5Categories.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="text-[14px] font-bold text-[#1F1F1F]">Top Expense Categories</div>
              <button
                onClick={() => navigate('/expense-category')}
                className="text-[12px] font-semibold text-[#1E3A8A] flex items-center gap-0.5"
              >
                See all <ChevronRight size={14} />
              </button>
            </div>
            <div className="bg-white rounded-xl border border-[#E3E5EA] px-4 py-3 space-y-3">
              {top5Categories.map(([cat, { count, amount }], i) => {
                const pct = Math.round((count / maxCatCount) * 100)
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[11px] font-bold text-[#B0B0B0] w-4 flex-shrink-0">#{i + 1}</span>
                        <span className="text-[13px] font-semibold text-[#1F1F1F] truncate">{cat}</span>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0 ml-2">
                        <span className="text-[12px] font-bold text-[#1F1F1F]">{symbol}{Number(amount).toLocaleString('en-US')}</span>
                        <span className="text-[10px] text-[#707070]">{count} req{count !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1E3A8A] rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Top 5 budget groups */}
        {top5Budget.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="text-[14px] font-bold text-[#1F1F1F]">Top Budget Groups</div>
              <button
                onClick={() => navigate('/budget')}
                className="text-[12px] font-semibold text-[#1E3A8A] flex items-center gap-0.5"
              >
                See all <ChevronRight size={14} />
              </button>
            </div>
            <div className="bg-white rounded-xl border border-[#E3E5EA] px-4 py-3 space-y-3">
              {top5Budget.map(({ code, name, budgeted, spent }, i) => {
                const pct     = budgeted > 0 ? Math.round((spent / budgeted) * 100) : 0
                const barPct  = Math.round((budgeted / maxBudgeted) * 100)
                const overBudget = spent > budgeted
                return (
                  <div key={name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[11px] font-bold text-[#B0B0B0] w-4 flex-shrink-0">#{i + 1}</span>
                        <span className="text-[10px] font-bold text-white bg-[#1E3A8A] px-1.5 py-0.5 rounded flex-shrink-0">{code}</span>
                        <span className="text-[13px] font-semibold text-[#1F1F1F] truncate">{name}</span>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0 ml-2">
                        <span className="text-[12px] font-bold text-[#1F1F1F]">{symbol}{Number(budgeted).toLocaleString('en-US')}</span>
                        <span className={`text-[10px] font-semibold ${overBudget ? 'text-[#B12A1B]' : 'text-[#707070]'}`}>
                          {pct}% used
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${overBudget ? 'bg-[#EF4444]' : 'bg-[#1E3A8A]'}`}
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}


      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/request')}
        className="fixed bottom-20 right-5 w-14 h-14 rounded-full bg-[#1E3A8A] text-white shadow-lg flex items-center justify-center active:opacity-80 z-40"
      >
        <Plus size={24} />
      </button>
    </div>
  )
}
