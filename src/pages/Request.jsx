import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, ChevronDown } from 'lucide-react'
import { useStore } from '../store'

const CURRENCY_SYMBOLS = { USD: '$', KHR: '៛', KRW: '₩', THB: '฿', EUR: '€', JPY: '¥', SGD: 'S$', CNY: '¥' }
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const STATUS_STYLE = {
  pending:  { label: 'Pending',  bg: 'bg-[#FFF3DF]', text: 'text-[#8A6408]' },
  approved: { label: 'Approved', bg: 'bg-[#E8F6EF]', text: 'text-[#1F6F4E]' },
  rejected: { label: 'Rejected', bg: 'bg-[#FFEDEA]', text: 'text-[#B12A1B]' },
}

const STATUS_TABS = [
  { key: 'All',      match: () => true },
  { key: 'Pending',  match: r => r.status === 'pending'  },
  { key: 'Approved', match: r => r.status === 'approved' },
  { key: 'Rejected', match: r => r.status === 'rejected' },
]

function groupByMonth(requests) {
  const map = {}
  requests.forEach(r => {
    const [yr, mo] = r.date.split('-')
    const key = `${yr}-${mo}`
    if (!map[key]) {
      map[key] = {
        key,
        label: `${MONTH_NAMES[parseInt(mo, 10) - 1].toUpperCase()} ${yr}`,
        items: [],
      }
    }
    map[key].items.push(r)
  })
  return Object.values(map).sort((a, b) => b.key.localeCompare(a.key))
}

// Compact select pill
function FilterSelect({ value, onChange, options, placeholder }) {
  return (
    <div className="relative flex-1">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full appearance-none bg-white border border-[#E3E5EA] rounded-xl px-3 py-2 pr-7 text-[13px] font-semibold text-[#1F1F1F] outline-none"
      >
        <option value="">{placeholder}</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#B0B0B0] pointer-events-none" />
    </div>
  )
}

export default function Request() {
  const navigate = useNavigate()
  const { requests, currency } = useStore()
  const symbol = CURRENCY_SYMBOLS[currency] ?? '៛'

  const ALL_YEARS = [...new Set(requests.map(r => r.date.slice(0, 4)))].sort().reverse()

  const [tab,         setTab]         = useState('All')
  const [search,      setSearch]      = useState('')
  const [filterYear,  setFilterYear]  = useState('')
  const [filterMonth, setFilterMonth] = useState('')

  const counts = Object.fromEntries(
    STATUS_TABS.map(t => [t.key, requests.filter(t.match).length])
  )

  const filtered = requests.filter(r => {
    const [yr, mo] = r.date.split('-')
    if (filterYear  && yr !== filterYear)               return false
    if (filterMonth && mo !== filterMonth.padStart(2,'0')) return false
    const currentTab = STATUS_TABS.find(t => t.key === tab)
    if (!currentTab?.match(r))                          return false
    const q = search.toLowerCase()
    return r.title.toLowerCase().includes(q) || r.requester.toLowerCase().includes(q)
  })

  const grouped = groupByMonth(filtered)

  const monthOptions = MONTH_NAMES.map((name, i) => ({
    value: String(i + 1),
    label: name,
  }))

  return (
    <div>
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3 border-b border-[#E3E5EA]">
        <h1 className="text-[22px] font-bold text-[#1F1F1F]">Requests</h1>
      </div>

      {/* Search */}
      <div className="px-4 pt-3 pb-2 bg-white">
        <div className="flex items-center gap-2 bg-[#F6F6F6] rounded-xl px-3 py-2.5">
          <Search size={16} className="text-[#B0B0B0] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search requests..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-[14px] text-[#1F1F1F] placeholder-[#B0B0B0] outline-none"
          />
        </div>
      </div>

      {/* Year / Month filter row */}
      <div className="flex items-center gap-2 px-4 pb-3 bg-white border-b border-[#F0F0F0]">
        <FilterSelect
          value={filterYear}
          onChange={v => setFilterYear(v)}
          options={ALL_YEARS.map(y => ({ value: y, label: y }))}
          placeholder="All Years"
        />
        <FilterSelect
          value={filterMonth}
          onChange={v => setFilterMonth(v)}
          options={monthOptions}
          placeholder="All Months"
        />
        {(filterYear || filterMonth) && (
          <button
            onClick={() => { setFilterYear(''); setFilterMonth('') }}
            className="text-[12px] font-semibold text-[#1E3A8A] whitespace-nowrap flex-shrink-0"
          >
            Clear
          </button>
        )}
      </div>

      {/* Status tabs with counts */}
      <div className="flex bg-white border-b border-[#E3E5EA] px-2 overflow-x-auto scrollbar-hide">
        {STATUS_TABS.map(({ key }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 flex-shrink-0 px-3 py-3 text-[13px] font-semibold border-b-2 transition-colors ${
              tab === key ? 'border-[#1E3A8A] text-[#1E3A8A]' : 'border-transparent text-[#707070]'
            }`}
          >
            {key}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
              tab === key ? 'bg-[#1E3A8A] text-white' : 'bg-[#F0F0F0] text-[#707070]'
            }`}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Grouped list */}
      <div className="p-4 space-y-6" style={{ paddingBottom: '96px' }}>
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[13px] text-[#B0B0B0]">No requests found</div>
        ) : (
          grouped.map(group => (
            <div key={group.key}>
              {/* Month section header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[13px] font-bold text-[#1F1F1F]">{group.label}</span>
                <span className="text-[11px] text-[#B0B0B0]">
                  · {group.items.length} request{group.items.length !== 1 ? 's' : ''}
                </span>
                <div className="flex-1 h-px bg-[#F0F0F0]" />
              </div>

              {/* Cards */}
              <div className="space-y-3">
                {group.items.map(req => {
                  const s = STATUS_STYLE[req.status] || STATUS_STYLE.pending
                  return (
                    <button
                      key={req.id}
                      onClick={() => navigate(`/request/${req.id}`)}
                      className="w-full bg-white rounded-xl border border-[#E3E5EA] px-4 py-4 text-left active:opacity-80"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-[14px] font-bold text-[#1F1F1F] leading-snug">{req.title}</div>
                          <div className="text-[12px] text-[#707070] mt-1">{req.requester} · {req.department}</div>
                          <div className="text-[11px] text-[#B0B0B0] mt-0.5">{req.date}</div>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <div className="text-[15px] font-bold text-[#1F1F1F]">{symbol}{Number(req.amount).toLocaleString('en-US')}</div>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${s.bg} ${s.text}`}>
                            {s.label}
                          </span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/request/new')}
        className="fixed bottom-20 right-5 w-14 h-14 rounded-full bg-[#1E3A8A] text-white shadow-lg flex items-center justify-center active:opacity-80 z-40"
      >
        <Plus size={24} />
      </button>
    </div>
  )
}
