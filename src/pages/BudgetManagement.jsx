import { useState, useRef } from 'react'
import PageHeader from '../components/layout/PageHeader'
import { ChevronDown, ChevronRight, Upload, Download, FileSpreadsheet } from 'lucide-react'
import { useStore } from '../store'
import { translations } from '../lib/i18n'
import * as XLSX from 'xlsx'

const CURRENCY_SYMBOLS = { USD: '$', KHR: '៛', KRW: '₩', THB: '฿', EUR: '€', JPY: '¥', SGD: 'S$', CNY: '¥' }

// ── Helpers ───────────────────────────────────────────────────────────────────

function sumNode(node) {
  if (node.budgeted !== undefined) {
    return { budgeted: node.budgeted, spent: node.spent }
  }
  return node.children.reduce(
    (acc, child) => {
      const c = sumNode(child)
      return { budgeted: acc.budgeted + c.budgeted, spent: acc.spent + c.spent }
    },
    { budgeted: 0, spent: 0 }
  )
}

function pctColor(pct) {
  if (pct >= 100) return 'bg-[#EF4444]'
  if (pct >= 85)  return 'bg-[#F59E0B]'
  return 'bg-[#22C55E]'
}

function remainingColor(rem) {
  if (rem < 0)   return 'text-[#B12A1B]'
  if (rem === 0) return 'text-[#707070]'
  return 'text-[#1F6F4E]'
}

// ── Excel helpers ─────────────────────────────────────────────────────────────

function downloadTemplate() {
  const templateRows = [
    ['Year', 'Level', 'Code', 'Name', 'Parent Code', 'Budgeted', 'Spent'],
    [2026, 'L1', '01',    'Operations',        '',      '', ''],
    [2026, 'L2', '0101',  'Office Expenses',   '01',    '', ''],
    [2026, 'L3', '01011', 'Stationery',        '0101',  4800000, 0],
    [2026, 'L3', '01012', 'Printing & Copying','0101',  8000000, 0],
    [2026, 'L2', '0102',  'Facilities',        '01',    '', ''],
    [2026, 'L3', '01021', 'Utilities',         '0102',  16000000, 0],
  ]

  const instructionRows = [
    ['INSTRUCTIONS'],
    [''],
    ['Column', 'Description', 'Rules'],
    ['Year',         'Fiscal year (e.g. 2026)',                 'Required. Number.'],
    ['Level',        'Budget level: L1, L2, or L3',            'Required. Must be L1, L2, or L3.'],
    ['Code',         'Unique budget code',                      'L1 = 2 digits, L2 = 4 digits, L3 = 5 digits.'],
    ['Name',         'Name of this budget line',               'Required.'],
    ['Parent Code',  'Code of the parent level',               'L1 = leave blank. L2 = L1 code. L3 = L2 code.'],
    ['Budgeted',     'Budget amount (L3 only)',                 'Required for L3. Leave blank for L1 and L2.'],
    ['Spent',        'Amount already spent (L3 only)',          'Optional. Defaults to 0.'],
  ]

  const wb = XLSX.utils.book_new()

  const wsData = XLSX.utils.aoa_to_sheet(templateRows)
  wsData['!cols'] = [
    { wch: 6 }, { wch: 6 }, { wch: 8 }, { wch: 28 }, { wch: 14 }, { wch: 14 }, { wch: 12 },
  ]
  XLSX.utils.book_append_sheet(wb, wsData, 'Budget Template')

  const wsInfo = XLSX.utils.aoa_to_sheet(instructionRows)
  wsInfo['!cols'] = [{ wch: 16 }, { wch: 42 }, { wch: 48 }]
  XLSX.utils.book_append_sheet(wb, wsInfo, 'Instructions')

  XLSX.writeFile(wb, 'BudgetManagement_Template.xlsx')
}

function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb   = XLSX.read(e.target.result, { type: 'array' })
        const ws   = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })

        // Find header row (row with 'Year' in first cell)
        const headerIdx = rows.findIndex(r => String(r[0]).trim().toLowerCase() === 'year')
        if (headerIdx < 0) { reject('Header row not found. Make sure column A is "Year".'); return }

        const dataRows = rows.slice(headerIdx + 1).filter(r => r.some(v => v !== ''))

        // Group by year → build tree
        const yearMap = {}
        for (const row of dataRows) {
          const year   = parseInt(row[0]) || 2026
          const level  = String(row[1]).trim().toUpperCase()
          const code   = String(row[2]).trim()
          const name   = String(row[3]).trim()
          const parent = String(row[4]).trim()
          const budgeted = Number(row[5]) || 0
          const spent    = Number(row[6]) || 0

          if (!code || !name) continue
          if (!yearMap[year]) yearMap[year] = { l1: {}, l2: {}, l3s: [] }

          if (level === 'L1') {
            yearMap[year].l1[code] = { code, name, year, children: [] }
          } else if (level === 'L2') {
            yearMap[year].l2[code] = { code, name, parent, children: [] }
          } else if (level === 'L3') {
            yearMap[year].l3s.push({ code, name, parent, budgeted, spent })
          }
        }

        const result = {}
        for (const [year, { l1, l2, l3s }] of Object.entries(yearMap)) {
          // Attach L3 → L2
          for (const l3 of l3s) {
            if (l2[l3.parent]) l2[l3.parent].children.push({ code: l3.code, name: l3.name, budgeted: l3.budgeted, spent: l3.spent })
          }
          // Attach L2 → L1
          for (const l2node of Object.values(l2)) {
            if (l1[l2node.parent]) l1[l2node.parent].children.push(l2node)
          }
          result[Number(year)] = Object.values(l1)
        }

        resolve(result)
      } catch (err) {
        reject('Failed to parse file: ' + err.message)
      }
    }
    reader.onerror = () => reject('Failed to read file.')
    reader.readAsArrayBuffer(file)
  })
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ budgeted, spent, thin }) {
  const pct = budgeted > 0 ? Math.min(Math.round((spent / budgeted) * 100), 100) : 0
  const h   = thin ? 'h-1' : 'h-1.5'
  return (
    <div className={`w-full ${h} bg-[#F0F0F0] rounded-full overflow-hidden`}>
      <div
        className={`h-full rounded-full transition-all ${pctColor(Math.round((spent / budgeted) * 100))}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

// ── Amount row ────────────────────────────────────────────────────────────────
function AmountRow({ budgeted, spent, small, fmt, t }) {
  const remaining = budgeted - spent
  const labelCls  = small ? 'text-[9px]'  : 'text-[10px]'
  const valueCls  = small ? 'text-[11px]' : 'text-[12px]'

  return (
    <div className="flex gap-1 mt-1.5">
      {[
        { label: t('budget'),    val: fmt(budgeted) },
        { label: t('spent'),     val: fmt(spent) },
        { label: t('remaining'), val: remaining < 0 ? `-${fmt(Math.abs(remaining))}` : fmt(remaining), cls: remainingColor(remaining) },
      ].map(({ label, val, cls }) => (
        <div key={label} className="flex-1 bg-[#F6F6F6] rounded-lg px-2 py-1.5 text-center">
          <div className={`${labelCls} text-[#B0B0B0] font-semibold uppercase tracking-wide`}>{label}</div>
          <div className={`${valueCls} font-bold mt-0.5 ${cls || 'text-[#1F1F1F]'}`}>{val}</div>
        </div>
      ))}
    </div>
  )
}

// ── L3 leaf row ───────────────────────────────────────────────────────────────
function L3Row({ node, fmt, t }) {
  const pct = node.budgeted > 0 ? Math.round((node.spent / node.budgeted) * 100) : 0
  return (
    <div className="ml-9 mt-2 bg-[#FAFAFA] rounded-xl border border-[#E3E5EA] px-3 py-2.5">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[10px] font-bold text-[#707070] bg-[#F0F0F0] px-1.5 py-0.5 rounded font-mono tracking-wide">
          {node.code}
        </span>
        <span className="text-[12px] font-semibold text-[#1F1F1F] flex-1 truncate">{node.name}</span>
        <span className={`text-[10px] font-bold flex-shrink-0 ${pct >= 100 ? 'text-[#B12A1B]' : pct >= 85 ? 'text-[#8A6408]' : 'text-[#1F6F4E]'}`}>
          {pct}%
        </span>
      </div>
      <ProgressBar budgeted={node.budgeted} spent={node.spent} thin />
      <AmountRow budgeted={node.budgeted} spent={node.spent} small fmt={fmt} t={t} />
    </div>
  )
}

// ── L2 row ────────────────────────────────────────────────────────────────────
function L2Row({ node, expanded, onToggle, fmt, t }) {
  const { budgeted, spent } = sumNode(node)
  const pct = budgeted > 0 ? Math.round((spent / budgeted) * 100) : 0
  return (
    <div className="ml-4 mt-2">
      <button onClick={onToggle} className="w-full bg-white rounded-xl border border-[#E3E5EA] px-3 py-3 text-left active:opacity-75">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#1E3A8A] bg-[#EAF0FF] px-1.5 py-0.5 rounded font-mono tracking-wide flex-shrink-0">
            {node.code}
          </span>
          <span className="text-[13px] font-bold text-[#1F1F1F] flex-1 truncate">{node.name}</span>
          <span className={`text-[10px] font-bold flex-shrink-0 ${pct >= 100 ? 'text-[#B12A1B]' : pct >= 85 ? 'text-[#8A6408]' : 'text-[#1F6F4E]'}`}>
            {pct}%
          </span>
          {expanded ? <ChevronDown size={14} className="text-[#B0B0B0] flex-shrink-0" /> : <ChevronRight size={14} className="text-[#B0B0B0] flex-shrink-0" />}
        </div>
        <div className="mt-2"><ProgressBar budgeted={budgeted} spent={spent} thin /></div>
        <AmountRow budgeted={budgeted} spent={spent} small fmt={fmt} t={t} />
      </button>
      {expanded && node.children.map(l3 => <L3Row key={l3.code} node={l3} fmt={fmt} t={t} />)}
    </div>
  )
}

// ── L1 row ────────────────────────────────────────────────────────────────────
function L1Row({ node, expanded, onToggleL1, expandedL2, onToggleL2, fmt, t }) {
  const { budgeted, spent } = sumNode(node)
  const pct       = budgeted > 0 ? Math.round((spent / budgeted) * 100) : 0
  const remaining = budgeted - spent
  return (
    <div className="bg-white rounded-xl border border-[#E3E5EA] overflow-hidden">
      <button onClick={onToggleL1} className="w-full px-4 py-4 text-left active:opacity-75">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="text-[11px] font-bold text-white bg-[#1E3A8A] px-2 py-0.5 rounded-lg font-mono tracking-wide flex-shrink-0">
            {node.code}
          </span>
          <span className="text-[15px] font-bold text-[#1F1F1F] flex-1">{node.name}</span>
          {expanded ? <ChevronDown size={16} className="text-[#707070] flex-shrink-0" /> : <ChevronRight size={16} className="text-[#707070] flex-shrink-0" />}
        </div>
        <ProgressBar budgeted={budgeted} spent={spent} />
        <div className="flex items-center justify-between mt-1.5 mb-2">
          <span className="text-[11px] text-[#707070]">{pct}% {t('used')}</span>
          <span className={`text-[11px] font-bold ${remainingColor(remaining)}`}>
            {remaining < 0 ? `${fmt(Math.abs(remaining))} ${t('overBudget')}` : `${fmt(remaining)} ${t('left')}`}
          </span>
        </div>
        <AmountRow budgeted={budgeted} spent={spent} fmt={fmt} t={t} />
      </button>
      {expanded && (
        <div className="px-3 pb-3 bg-[#F9FAFB] border-t border-[#F0F0F0]">
          {node.children.map(l2 => (
            <L2Row
              key={l2.code}
              node={l2}
              expanded={!!expandedL2[l2.code]}
              onToggle={() => onToggleL2(l2.code)}
              fmt={fmt}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BudgetManagement() {
  const { language, currency, budgetTree, importBudgetYear } = useStore()
  const t      = (key) => translations[language]?.[key] ?? translations.en[key] ?? key
  const symbol = CURRENCY_SYMBOLS[currency] ?? '$'
  const fmt    = (n) => symbol + Number(n).toLocaleString('en-US')

  const fileRef = useRef()
  const [expandedL1, setExpandedL1] = useState({})
  const [expandedL2, setExpandedL2] = useState({})
  const [filterYear, setFilterYear]  = useState('')
  const [uploading,  setUploading]   = useState(false)
  const [toast,      setToast]       = useState(null)

  // Collect unique years from tree
  const allYears = [...new Set(budgetTree.map(n => n.year || 2026))].sort().reverse()

  // Active year for display (default to latest)
  const activeYear = filterYear ? Number(filterYear) : (allYears[0] ?? 2026)
  const visibleTree = budgetTree.filter(n => (n.year || 2026) === activeYear)

  function toggleL1(code) { setExpandedL1(prev => ({ ...prev, [code]: !prev[code] })) }
  function toggleL2(code) { setExpandedL2(prev => ({ ...prev, [code]: !prev[code] })) }

  function showToast(msg, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setUploading(true)
    try {
      const parsed = await parseExcel(file)
      for (const [year, nodes] of Object.entries(parsed)) {
        importBudgetYear(Number(year), nodes)
        setFilterYear(String(year))
      }
      const years = Object.keys(parsed).join(', ')
      showToast(`Imported budget for ${years} ✓`)
    } catch (err) {
      showToast(typeof err === 'string' ? err : 'Import failed.', false)
    }
    setUploading(false)
  }

  const grand = visibleTree.reduce(
    (acc, node) => { const s = sumNode(node); return { budgeted: acc.budgeted + s.budgeted, spent: acc.spent + s.spent } },
    { budgeted: 0, spent: 0 }
  )
  const grandPct       = grand.budgeted > 0 ? Math.round((grand.spent / grand.budgeted) * 100) : 0
  const grandRemaining = grand.budgeted - grand.spent

  return (
    <div className="app-shell">
      <PageHeader title={t('budgetTitle')} />

      <div className="page-content scrollbar-hide p-4 space-y-4" style={{ paddingBottom: '96px' }}>

        {/* Year filter + action buttons row */}
        <div className="flex items-center gap-2">
          {/* Year filter */}
          <div className="relative flex-1">
            <select
              value={filterYear || String(activeYear)}
              onChange={e => setFilterYear(e.target.value)}
              className="w-full appearance-none bg-white border border-[#E3E5EA] rounded-xl px-3 py-2.5 pr-8 text-[13px] font-bold text-[#1F1F1F] outline-none"
            >
              {allYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B0B0B0] pointer-events-none" />
          </div>

          {/* Download template */}
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-1.5 bg-white border border-[#E3E5EA] rounded-xl px-3 py-2.5 text-[12px] font-bold text-[#1F6F4E] flex-shrink-0"
          >
            <Download size={14} /> Template
          </button>

          {/* Upload Excel */}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 bg-[#1E3A8A] rounded-xl px-3 py-2.5 text-[12px] font-bold text-white flex-shrink-0 disabled:opacity-50"
          >
            <Upload size={14} /> {uploading ? 'Importing…' : 'Upload'}
          </button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleUpload} />
        </div>

        {/* Grand total hero */}
        <div className="bg-[#1E3A8A] rounded-xl px-5 py-4 text-white">
          <div className="text-[12px] font-semibold opacity-75 mb-0.5">{t('totalBudget')} – {activeYear}</div>
          <div className="text-[30px] font-bold leading-tight">{fmt(grand.budgeted)}</div>
          <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden mt-3 mb-2">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${Math.min(grandPct, 100)}%` }} />
          </div>
          <div className="flex justify-between text-[11px] opacity-80">
            <span>{fmt(grand.spent)} {t('spent')} ({grandPct}%)</span>
            <span className={grandRemaining < 0 ? 'text-red-300 font-bold' : ''}>
              {grandRemaining >= 0 ? `${fmt(grandRemaining)} ${t('left')}` : `${fmt(Math.abs(grandRemaining))} ${t('overBudget')}`}
            </span>
          </div>
          <div className="flex gap-2 mt-3">
            {[
              { label: t('budget'),    value: fmt(grand.budgeted) },
              { label: t('spent'),     value: fmt(grand.spent) },
              { label: t('remaining'), value: fmt(grandRemaining) },
            ].map(({ label, value }) => (
              <div key={label} className="flex-1 bg-white/15 rounded-xl px-2 py-2 text-center">
                <div className="text-[9px] opacity-70 uppercase tracking-wide font-bold">{label}</div>
                <div className="text-[12px] font-bold mt-0.5">{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-1">
          {[
            { color: 'bg-[#22C55E]', label: 'Under 85%' },
            { color: 'bg-[#F59E0B]', label: '85–99%' },
            { color: 'bg-[#EF4444]', label: t('overBudget') },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-[11px] text-[#707070]">
              <div className={`w-2.5 h-2.5 rounded-full ${color}`} /> {label}
            </div>
          ))}
        </div>

        {/* Empty state */}
        {visibleTree.length === 0 && (
          <div className="text-center py-12">
            <FileSpreadsheet size={40} className="mx-auto text-[#D1D5DB] mb-3" />
            <div className="text-[14px] font-bold text-[#707070]">No budget for {activeYear}</div>
            <div className="text-[12px] text-[#B0B0B0] mt-1">Download the template, fill it in, then upload.</div>
          </div>
        )}

        {/* L1 tree */}
        {visibleTree.map(l1 => (
          <L1Row
            key={l1.code}
            node={l1}
            expanded={!!expandedL1[l1.code]}
            onToggleL1={() => toggleL1(l1.code)}
            expandedL2={expandedL2}
            onToggleL2={toggleL2}
            fmt={fmt}
            t={t}
          />
        ))}

      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-24 left-4 right-4 rounded-xl px-4 py-3 text-white text-[13px] font-semibold shadow-lg z-50 text-center ${toast.ok ? 'bg-[#22C55E]' : 'bg-[#EF4444]'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
