import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import Badge, { invoiceStatusVariant, invoiceStatusLabel } from '../components/ui/Badge'
import Card from '../components/ui/Card'
import { formatMonthYear } from '../lib/dayCounter'
import { ChevronRight, SlidersHorizontal, X } from 'lucide-react'

const STATUS_TABS = [
  { key: 'all',       label: 'All'         },
  { key: 'progress',  label: 'In Progress' },
  { key: 'paid',      label: 'Paid'        },
  { key: 'overdue',   label: 'Overdue'     },
  { key: 'cancelled', label: 'Cancelled'   },
]

export default function Billing() {
  const navigate    = useNavigate()
  const getAllInvoices = useStore(s => s.getAllInvoices)

  const [activeTab,  setActiveTab]  = useState('all')
  const [filterOpen, setFilterOpen] = useState(false)
  const [dateFrom,   setDateFrom]   = useState('')
  const [dateTo,     setDateTo]     = useState('')

  const allInvoices = getAllInvoices()

  // Apply status + date filters
  const filtered = useMemo(() => {
    let list = activeTab === 'all'
      ? allInvoices
      : allInvoices.filter(inv => inv.status === activeTab)

    if (dateFrom) list = list.filter(inv => inv.periodStart >= dateFrom)
    if (dateTo)   list = list.filter(inv => inv.periodStart <= dateTo)

    return list
  }, [allInvoices, activeTab, dateFrom, dateTo])

  // Counts per status (respecting date filter)
  const counts = useMemo(() => {
    let base = allInvoices
    if (dateFrom) base = base.filter(inv => inv.periodStart >= dateFrom)
    if (dateTo)   base = base.filter(inv => inv.periodStart <= dateTo)
    return {
      all:       base.length,
      progress:  base.filter(i => i.status === 'progress').length,
      paid:      base.filter(i => i.status === 'paid').length,
      overdue:   base.filter(i => i.status === 'overdue').length,
      cancelled: base.filter(i => i.status === 'cancelled').length,
    }
  }, [allInvoices, dateFrom, dateTo])

  const hasDateFilter = dateFrom || dateTo

  function clearDates() { setDateFrom(''); setDateTo('') }

  function fmtPeriod(inv) {
    return new Date(inv.periodStart).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }
  function fmtDue(inv) {
    return new Date(inv.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }
  function fmtDate(str) {
    if (!str) return ''
    return new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white">
        <div className="px-4 pt-4 pb-2 flex items-start justify-between">
          <div>
            <div className="text-[12px] text-[#707070]">{formatMonthYear()}</div>
            <h1 className="text-[22px] font-bold text-[#1F1F1F]">Billing</h1>
          </div>
          <button
            onClick={() => setFilterOpen(v => !v)}
            className={`mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-[1.5px] text-[12px] font-semibold transition-colors ${
              hasDateFilter
                ? 'border-[#D64045] bg-[#FFEDEA] text-[#D64045]'
                : 'border-[#E3E5EA] bg-white text-[#707070]'
            }`}
          >
            <SlidersHorizontal size={13} />
            Filter
            {hasDateFilter && (
              <span className="w-4 h-4 bg-[#D64045] text-white rounded-full text-[9px] font-bold flex items-center justify-center">1</span>
            )}
          </button>
        </div>

        {/* Date filter panel */}
        {filterOpen && (
          <div className="px-4 pb-3 border-b border-[#E3E5EA]">
            <div className="bg-[#F6F6F6] rounded-xl p-3 space-y-2.5">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] font-bold text-[#707070] uppercase tracking-wide">Filter by Period</span>
                {hasDateFilter && (
                  <button onClick={clearDates} className="flex items-center gap-1 text-[11px] font-semibold text-[#D64045]">
                    <X size={11} /> Clear
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-[#707070] mb-1 block">From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border-[1.5px] border-[#E3E5EA] text-[12px] bg-white outline-none focus:border-[#D64045]"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-[#707070] mb-1 block">To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border-[1.5px] border-[#E3E5EA] text-[12px] bg-white outline-none focus:border-[#D64045]"
                  />
                </div>
              </div>
              {hasDateFilter && (
                <div className="text-[11px] text-[#707070]">
                  Showing invoices with period start
                  {dateFrom && <> from <span className="font-semibold text-[#1F1F1F]">{fmtDate(dateFrom)}</span></>}
                  {dateTo   && <> to <span className="font-semibold text-[#1F1F1F]">{fmtDate(dateTo)}</span></>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status tabs */}
        <div className="flex border-b border-[#E3E5EA] px-4 overflow-x-auto scrollbar-hide">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 px-3 py-2.5 text-[12px] font-bold border-b-2 -mb-px transition-colors ${
                activeTab === tab.key
                  ? 'text-[#D64045] border-[#D64045]'
                  : 'text-[#707070] border-transparent'
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-[11px] ${activeTab === tab.key ? 'text-[#D64045]' : 'text-[#B0B0B0]'}`}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="p-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[14px] text-[#707070]">No invoices found</div>
        ) : (
          <Card padding={false}>
            {filtered.map((inv, i) => (
              <div key={inv.id}>
                <div
                  className="flex items-center justify-between px-4 py-3.5 cursor-pointer active:opacity-80"
                  onClick={() => navigate(`/invoice/${inv.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-bold text-[#1F1F1F]">
                      {inv.roomSnapshot?.name} — {fmtPeriod(inv)}
                    </div>
                    <div className="text-[11px] text-[#707070] mt-0.5">
                      {inv.tenantSnapshot?.name} · Due {fmtDue(inv)}
                    </div>
                    <div className="text-[11px] text-[#707070]">{inv.id}</div>
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-[14px] font-bold text-[#1F1F1F]">${inv.total?.toFixed(2)}</div>
                      <Badge variant={invoiceStatusVariant(inv.status)}>
                        {invoiceStatusLabel(inv.status)}
                      </Badge>
                    </div>
                    <ChevronRight size={16} className="text-[#B0B0B0]" />
                  </div>
                </div>
                {i < filtered.length - 1 && <div className="h-px bg-[#E3E5EA] mx-4" />}
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  )
}
