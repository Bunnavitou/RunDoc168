import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader'
import { MOCK_CATEGORIES, APPROVAL_TYPES } from '../lib/mockData'
import { useStore } from '../store'
import {
  Plus, Trash2, ChevronRight, ChevronLeft, ChevronDown,
  Search, X, CheckCircle, AlertCircle, Camera,
} from 'lucide-react'

const CURRENCY_SYMBOLS = { USD: '$', KHR: '៛', KRW: '₩', THB: '฿', EUR: '€', JPY: '¥', SGD: 'S$', CNY: '¥' }

const genReqNo = () =>
  `REQ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`

// ── Section header ─────────────────────────────────────────────────────────────
function SectionHeader({ number, title, optional }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-7 h-7 rounded-full bg-[#1E3A8A] flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0">
        {number}
      </div>
      <div className="text-[16px] font-bold text-[#1F1F1F]">{title}</div>
      {optional && <span className="text-[11px] text-[#B0B0B0] font-medium">Optional</span>}
    </div>
  )
}

// ── Department field ───────────────────────────────────────────────────────────
function DepartmentField({ value, onChange }) {
  const [open, setOpen]  = useState(false)
  const containerRef     = useRef(null)
  const inputRef         = useRef(null)

  const suggestions = value.trim()
    ? MOCK_CATEGORIES.filter(c => c.name.toLowerCase().includes(value.toLowerCase()))
    : MOCK_CATEGORIES

  useEffect(() => {
    function onDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <div className={`flex items-center border-[1.5px] rounded-xl bg-white transition-colors ${open ? 'border-[#1E3A8A]' : 'border-[#E3E5EA]'}`}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search department..."
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          className="flex-1 px-4 py-3 text-[14px] text-[#1F1F1F] bg-transparent outline-none"
        />
        <button type="button" onClick={() => { setOpen(v => !v); inputRef.current?.focus() }} className="px-3 flex-shrink-0">
          <ChevronDown size={18} className={`text-[#B0B0B0] transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-[#E3E5EA] shadow-xl z-30 overflow-hidden max-h-52 overflow-y-auto">
          {suggestions.length === 0
            ? <div className="px-4 py-3 text-[13px] text-[#B0B0B0]">No match found</div>
            : suggestions.map(c => (
              <button
                key={c.id}
                onMouseDown={e => e.preventDefault()}
                onClick={() => { onChange(c.name); setOpen(false) }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left ${value === c.name ? 'bg-[#EAF0FF]' : 'hover:bg-[#F6F6F6]'}`}
              >
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                <span className={`text-[14px] flex-1 ${value === c.name ? 'font-bold text-[#1E3A8A]' : 'text-[#1F1F1F]'}`}>{c.name}</span>
              </button>
            ))
          }
        </div>
      )}
    </div>
  )
}

// ── Budget item picker row ─────────────────────────────────────────────────────
function BudgetItemRow({ l3, l1Name, l2Name, symbol, added, onAdd }) {  // eslint-disable-line
  const remaining = l3.budgeted - l3.spent
  const pct       = l3.budgeted > 0 ? Math.round((l3.spent / l3.budgeted) * 100) : 0
  const isOver    = remaining <= 0

  return (
    <div className="bg-white rounded-xl border border-[#E3E5EA] px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-bold font-mono bg-[#F0F0F0] text-[#707070] px-1.5 py-0.5 rounded">{l3.code}</span>
            <span className="text-[10px] text-[#B0B0B0]">{l1Name} › {l2Name}</span>
          </div>
          <div className="text-[13px] font-semibold text-[#1F1F1F]">{l3.name}</div>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 h-1 bg-[#F0F0F0] rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${pct >= 100 ? 'bg-[#EF4444]' : pct >= 85 ? 'bg-[#F59E0B]' : 'bg-[#22C55E]'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
            </div>
            <span className={`text-[10px] font-bold flex-shrink-0 ${isOver ? 'text-[#B12A1B]' : 'text-[#1F6F4E]'}`}>
              {isOver ? 'No budget' : `${symbol}${Number(remaining).toLocaleString('en-US')} left`}
            </span>
          </div>
        </div>
        <button
          onClick={() => !isOver && onAdd(l3)}
          disabled={added || isOver}
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
            added    ? 'bg-[#E8F6EF] text-[#1F6F4E] cursor-default' :
            isOver   ? 'bg-[#F0F0F0] text-[#B0B0B0] cursor-not-allowed' :
                       'bg-[#1E3A8A] text-white active:opacity-75'
          }`}
        >
          {added ? <CheckCircle size={16} /> : <Plus size={16} />}
        </button>
      </div>
    </div>
  )
}

// ── Budget Item Picker overlay ─────────────────────────────────────────────────
function BudgetPicker({ budgetTree, symbol, onClose, onAdd, addedCodes }) {
  const [search, setSearch] = useState('')
  const [selL1,  setSelL1]  = useState(null)
  const [selL2,  setSelL2]  = useState(null)

  // Flatten all L3 nodes
  const allL3 = budgetTree.flatMap(l1 =>
    l1.children.flatMap(l2 =>
      l2.children.map(l3 => ({ ...l3, l1Name: l1.name, l2Name: l2.name }))
    )
  )

  const isSearching = search.trim().length > 0
  const searchResults = allL3.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.l1Name.toLowerCase().includes(search.toLowerCase()) ||
    i.l2Name.toLowerCase().includes(search.toLowerCase()) ||
    i.code.includes(search)
  )

  const currentL1 = selL1 ? budgetTree.find(l1 => l1.code === selL1) : null
  const currentL2 = (selL2 && currentL1) ? currentL1.children.find(l2 => l2.code === selL2) : null

  function back() { if (selL2) setSelL2(null); else setSelL1(null) }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F6F6F6]">
      {/* Header */}
      <div className="bg-white flex items-center gap-3 px-4 py-3 border-b border-[#E3E5EA] flex-shrink-0">
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F6F6F6] flex items-center justify-center">
          <X size={18} className="text-[#1F1F1F]" />
        </button>
        <div className="text-[17px] font-bold text-[#1F1F1F]">Select Budget Item</div>
      </div>

      {/* Search */}
      <div className="bg-white px-4 py-3 border-b border-[#F0F0F0] flex-shrink-0">
        <div className="flex items-center gap-2 bg-[#F6F6F6] rounded-xl px-3 py-2.5">
          <Search size={16} className="text-[#B0B0B0] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search budget items..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-[14px] text-[#1F1F1F] placeholder-[#B0B0B0] outline-none"
          />
          {search && <button onClick={() => setSearch('')}><X size={14} className="text-[#B0B0B0]" /></button>}
        </div>
      </div>

      {/* Breadcrumb */}
      {!isSearching && (currentL1 || currentL2) && (
        <div className="bg-[#F6F6F6] border-b border-[#E3E5EA] px-4 py-2 flex items-center gap-1 flex-shrink-0 text-[12px]">
          <button onClick={() => { setSelL1(null); setSelL2(null) }} className="font-semibold text-[#1E3A8A]">All</button>
          {currentL1 && (
            <><ChevronRight size={12} className="text-[#B0B0B0]" />
            <button onClick={() => setSelL2(null)} className={`font-semibold ${selL2 ? 'text-[#1E3A8A]' : 'text-[#1F1F1F]'}`}>{currentL1.name}</button></>
          )}
          {currentL2 && (
            <><ChevronRight size={12} className="text-[#B0B0B0]" />
            <span className="font-semibold text-[#1F1F1F]">{currentL2.name}</span></>
          )}
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
        {isSearching && (
          searchResults.length === 0
            ? <div className="text-center py-12 text-[13px] text-[#B0B0B0]">No items found</div>
            : searchResults.map(item => (
              <BudgetItemRow key={item.code} l3={item} l1Name={item.l1Name} l2Name={item.l2Name}
                symbol={symbol} added={addedCodes.has(item.code)}
                onAdd={(l3) => { onAdd(l3); onClose() }}
              />
            ))
        )}
        {!isSearching && !selL1 && budgetTree.map(l1 => (
          <button key={l1.code} onClick={() => { setSelL1(l1.code); setSelL2(null) }}
            className="w-full bg-white rounded-xl border border-[#E3E5EA] px-4 py-3.5 flex items-center justify-between text-left active:opacity-80"
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold font-mono bg-[#1E3A8A] text-white px-1.5 py-0.5 rounded">{l1.code}</span>
              <span className="text-[14px] font-semibold text-[#1F1F1F]">{l1.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#B0B0B0]">{l1.children.reduce((s, l2) => s + l2.children.length, 0)} items</span>
              <ChevronRight size={16} className="text-[#B0B0B0]" />
            </div>
          </button>
        ))}
        {!isSearching && selL1 && !selL2 && currentL1?.children.map(l2 => (
          <button key={l2.code} onClick={() => setSelL2(l2.code)}
            className="w-full bg-white rounded-xl border border-[#E3E5EA] px-4 py-3.5 flex items-center justify-between text-left active:opacity-80"
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold font-mono bg-[#EAF0FF] text-[#1E3A8A] px-1.5 py-0.5 rounded">{l2.code}</span>
              <span className="text-[14px] font-semibold text-[#1F1F1F]">{l2.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#B0B0B0]">{l2.children.length} items</span>
              <ChevronRight size={16} className="text-[#B0B0B0]" />
            </div>
          </button>
        ))}
        {!isSearching && selL1 && selL2 && currentL2?.children.map(l3 => (
          <BudgetItemRow key={l3.code} l3={l3} l1Name={currentL1.name} l2Name={currentL2.name}
            symbol={symbol} added={addedCodes.has(l3.code)}
            onAdd={(l3item, l1n, l2n) => { onAdd(l3item, l1n, l2n); onClose() }}
          />
        ))}
      </div>

      {!isSearching && (selL1 || selL2) && (
        <div className="bg-white border-t border-[#E3E5EA] px-4 py-3 flex-shrink-0">
          <button onClick={back} className="flex items-center gap-1.5 text-[14px] font-semibold text-[#1E3A8A]">
            <ChevronLeft size={16} /> Back
          </button>
        </div>
      )}
    </div>
  )
}

// ── Amount input for each request line item ────────────────────────────────────
function RequestItemRow({ item, symbol, onAmountChange, onRemove }) {
  const remaining = item.budgeted - item.spent
  return (
    <div className="flex items-start px-4 py-3 gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[10px] font-mono font-bold bg-[#F0F0F0] text-[#707070] px-1.5 py-0.5 rounded">{item.budgetCode}</span>
        </div>
        <div className="text-[12px] font-semibold text-[#1F1F1F]">{item.name}</div>
        <div className="text-[10px] text-[#B0B0B0] mt-0.5">Available: {symbol}{Number(remaining).toLocaleString('en-US')}</div>
      </div>
      <div className="relative w-28 flex-shrink-0">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-[#707070]">{symbol}</span>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={remaining}
          value={item.amount}
          onChange={e => onAmountChange(item.budgetCode, e.target.value)}
          className="w-full pl-6 pr-2 py-1.5 border-[1.5px] border-[#E3E5EA] rounded-lg text-[12px] font-bold text-[#1F1F1F] bg-white outline-none focus:border-[#1E3A8A]"
        />
      </div>
      <button onClick={() => onRemove(item.budgetCode)}
        className="w-7 h-7 rounded-lg bg-[#FFEDEA] flex items-center justify-center flex-shrink-0 mt-0.5">
        <Trash2 size={13} className="text-[#B12A1B]" />
      </button>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function NewRequest() {
  const navigate  = useNavigate()
  const { currency, budgetTree, authUser, submitRequest } = useStore()
  const symbol = CURRENCY_SYMBOLS[currency] ?? '៛'

  const [reqNo, setReqNo]           = useState(genReqNo)
  const [registerDate, setRegisterDate] = useState(new Date().toISOString().slice(0, 10))
  const [department, setDepartment] = useState('')
  const [title, setTitle]           = useState('')
  const [items, setItems]           = useState([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [approvalType, setApprovalType] = useState('')
  const [priority, setPriority] = useState('normal')
  const [note, setNote]         = useState('')
  const [photos, setPhotos]     = useState([])
  const fileRef                 = useRef(null)

  const addedCodes = new Set(items.map(i => i.budgetCode))

  function addItem(l3) {
    if (addedCodes.has(l3.code)) return
    const remaining = l3.budgeted - l3.spent
    setItems(prev => [...prev, {
      budgetCode: l3.code,
      name:       l3.name,
      budgeted:   l3.budgeted,
      spent:      l3.spent,
      amount:     Math.min(1000000, remaining),
    }])
  }

  function setAmount(code, val) {
    const item = items.find(i => i.budgetCode === code)
    const max  = item ? item.budgeted - item.spent : Infinity
    const n    = Math.min(Math.max(0, parseInt(val) || 0), max)
    setItems(prev => prev.map(i => i.budgetCode === code ? { ...i, amount: n } : i))
  }

  function removeItem(code) {
    setItems(prev => prev.filter(i => i.budgetCode !== code))
  }

  function handlePhoto(e) {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev =>
        setPhotos(prev => [...prev, { id: `${Date.now()}-${Math.random()}`, dataUrl: ev.target.result, name: file.name }])
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const grandTotal = items.reduce((s, i) => s + (i.amount || 0), 0)
  const isValid    = department && title.trim() && items.length > 0 && approvalType

  function handleSubmit() {
    if (!isValid) return
    const req = {
      id:             `req-${Date.now()}`,
      requestNo:      reqNo,
      title:          title.trim(),
      category:       department,
      amount:         grandTotal,
      status:         'pending',
      requester:      authUser?.name || 'Me',
      department,
      date:           registerDate,
      description:    '',
      priority,
      note:           note.trim(),
      approvalTypeId: approvalType,
      items:          items.map(i => ({ name: i.name, budgetCode: i.budgetCode, amount: i.amount })),
      photos:         photos.map(p => p.dataUrl),
      attachments:    0,
    }
    submitRequest(req)
    navigate('/request')
  }

  return (
    <>
      <div className="app-shell">
        <PageHeader title="New Request" />

        <div className="page-content scrollbar-hide">
          <div className="p-4 space-y-8 pb-32">

            {/* ── Section 1: Requester Information ─────────────────── */}
            <div>
              <SectionHeader number={1} title="Requester Information" />
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-[#707070] uppercase tracking-wider mb-1.5 block">Expense Category</label>
                  <DepartmentField value={department} onChange={setDepartment} />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#707070] uppercase tracking-wider mb-1.5 block">Request No.</label>
                  <input type="text" value={reqNo} onChange={e => setReqNo(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-[1.5px] border-[#E3E5EA] text-[14px] text-[#1F1F1F] bg-white outline-none focus:border-[#1E3A8A]" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#707070] uppercase tracking-wider mb-1.5 block">Register Date</label>
                  <input type="date" value={registerDate} onChange={e => setRegisterDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-[1.5px] border-[#E3E5EA] text-[14px] text-[#1F1F1F] bg-white outline-none focus:border-[#1E3A8A]" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#707070] uppercase tracking-wider mb-1.5 block">Request Title</label>
                  <input type="text" placeholder="e.g. Office Supplies Q2" value={title} onChange={e => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-[1.5px] border-[#E3E5EA] text-[14px] text-[#1F1F1F] bg-white outline-none focus:border-[#1E3A8A]" />
                </div>
              </div>
            </div>

            {/* ── Section 2: Expense Items (from Budget) ───────────── */}
            <div>
              <SectionHeader number={2} title="Expense Items" />

              {items.length > 0 && (
                <div className="bg-white rounded-xl border border-[#E3E5EA] overflow-hidden mb-3">
                  <div className="flex items-center px-4 py-2.5 bg-[#F6F6F6] border-b border-[#E3E5EA]">
                    <div className="flex-1 text-[11px] font-bold text-[#707070] uppercase tracking-wide">Budget Line Item</div>
                    <div className="w-28 text-center text-[11px] font-bold text-[#707070] uppercase tracking-wide">Amount ({currency})</div>
                    <div className="w-7" />
                  </div>
                  {items.map((item, i) => (
                    <div key={item.budgetCode} className={i < items.length - 1 ? 'border-b border-[#F0F0F0]' : ''}>
                      <RequestItemRow item={item} symbol={symbol} onAmountChange={setAmount} onRemove={removeItem} />
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-4 py-3 bg-[#F6F6F6] border-t border-[#E3E5EA]">
                    <span className="text-[12px] font-bold text-[#707070]">Grand Total</span>
                    <span className="text-[17px] font-bold text-[#1E3A8A]">{symbol}{Number(grandTotal).toLocaleString('en-US')}</span>
                  </div>
                </div>
              )}

              <button onClick={() => setPickerOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-[1.5px] border-dashed border-[#1E3A8A] text-[#1E3A8A] text-[14px] font-semibold active:opacity-70">
                <Plus size={16} /> Add from Budget
              </button>
            </div>

            {/* ── Section 3: Type of Request ───────────────────────── */}
            <div>
              <SectionHeader number={3} title="Request Type - Team Approval" />
              <div className="space-y-2">
                {APPROVAL_TYPES.map(type => {
                  const active = approvalType === type.id
                  return (
                    <button key={type.id} onClick={() => setApprovalType(type.id)}
                      className={`w-full px-4 py-4 rounded-xl border-[1.5px] text-left transition-colors ${active ? 'border-[#1E3A8A] bg-[#EAF0FF]' : 'border-[#E3E5EA] bg-white'}`}
                    >
                      <div className={`text-[14px] font-bold ${active ? 'text-[#1E3A8A]' : 'text-[#1F1F1F]'}`}>{type.name}</div>
                      <div className="text-[11px] text-[#707070] mt-0.5">{type.description}</div>
                      <div className="flex items-center gap-1 mt-3 flex-wrap">
                        {type.steps.map((step, i) => (
                          <span key={i} className="flex items-center gap-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${active ? 'bg-[#1E3A8A] text-white' : 'bg-[#F0F0F0] text-[#707070]'}`}>{step.role ?? step}</span>
                            {i < type.steps.length - 1 && <ChevronRight size={10} className="text-[#B0B0B0]" />}
                          </span>
                        ))}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── Section 4: Remark ────────────────────────────────── */}
            <div>
              <SectionHeader number={4} title="Remark" />
              <div className="space-y-3">
                <div className="bg-white rounded-xl border border-[#E3E5EA] px-4 py-4">
                  <div className="text-[11px] font-bold text-[#707070] uppercase tracking-wider mb-3">Priority</div>
                  <div className="flex gap-2">
                    {[
                      { key: 'normal', label: 'Normal', activeClass: 'border-[#1E3A8A] bg-[#EAF0FF] text-[#1E3A8A]' },
                      { key: 'urgent', label: 'Urgent', activeClass: 'border-[#EF4444] bg-[#FFEDEA] text-[#B12A1B]' },
                    ].map(({ key, label, activeClass }) => (
                      <button key={key} onClick={() => setPriority(key)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border-[1.5px] text-[13px] font-bold transition-colors ${priority === key ? activeClass : 'border-[#E3E5EA] text-[#707070]'}`}
                      >
                        {key === 'urgent' && <AlertCircle size={14} />}
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#707070] uppercase tracking-wider mb-1.5 block">Note (Optional)</label>
                  <textarea placeholder="Add any additional notes..." value={note} onChange={e => setNote(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border-[1.5px] border-[#E3E5EA] text-[14px] text-[#1F1F1F] bg-white outline-none focus:border-[#1E3A8A] resize-none" />
                </div>
              </div>
            </div>

            {/* ── Section 5: Attachments ───────────────────────────── */}
            <div>
              <SectionHeader number={5} title="Attachments" optional />
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {photos.map(p => (
                    <div key={p.id} className="relative aspect-square rounded-xl overflow-hidden border border-[#E3E5EA]">
                      <img src={p.dataUrl} alt={p.name} className="w-full h-full object-cover" />
                      <button onClick={() => setPhotos(prev => prev.filter(ph => ph.id !== p.id))}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center">
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => fileRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-[1.5px] border-dashed border-[#E3E5EA] text-[#707070] text-[14px] font-semibold active:opacity-70">
                <Camera size={16} />
                {photos.length === 0 ? 'Add Photos / Documents' : 'Add More'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhoto} />
            </div>

          </div>
        </div>

        {/* Sticky submit */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 py-3 bg-white border-t border-[#E3E5EA] z-30">
          {!isValid && (
            <div className="text-[11px] text-[#B0B0B0] text-center mb-2">Fill in all required sections to submit</div>
          )}
          <button onClick={handleSubmit} disabled={!isValid}
            className="w-full py-3.5 rounded-xl bg-[#1E3A8A] text-white text-[15px] font-bold active:opacity-80 disabled:opacity-40 transition-opacity">
            Submit Request
          </button>
        </div>
      </div>

      {pickerOpen && (
        <BudgetPicker
          budgetTree={budgetTree}
          symbol={symbol}
          onClose={() => setPickerOpen(false)}
          onAdd={addItem}
          addedCodes={addedCodes}
        />
      )}
    </>
  )
}
