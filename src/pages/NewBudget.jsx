import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader'
import Button from '../components/ui/Button'
import { useStore } from '../store'
import { translations } from '../lib/i18n'
import { ChevronRight } from 'lucide-react'

const CURRENCY_SYMBOLS = { USD: '$', KHR: '៛', KRW: '₩', THB: '฿', EUR: '€', JPY: '¥', SGD: 'S$', CNY: '¥' }

const LEVEL_INFO = {
  L1: { label: 'Level 1',  color: 'bg-[#1E3A8A]',  light: 'bg-[#EAF0FF]', text: 'text-[#1E3A8A]', desc: 'Top-level department or division' },
  L2: { label: 'Level 2',  color: 'bg-[#7C3AED]',  light: 'bg-[#F3EEFF]', text: 'text-[#7C3AED]', desc: 'Sub-category under a department'   },
  L3: { label: 'Level 3',  color: 'bg-[#059669]',  light: 'bg-[#E8F6EF]', text: 'text-[#059669]', desc: 'Budget line item (has budget amount)' },
}

function codeHint(level) {
  if (level === 'L1') return '2-digit code, e.g. 06'
  if (level === 'L2') return '4-digit code, e.g. 0601'
  return '5-digit code, e.g. 06011'
}

function codePlaceholder(level) {
  if (level === 'L1') return '06'
  if (level === 'L2') return '0601'
  return '06011'
}

export default function NewBudget() {
  const navigate = useNavigate()
  const { language, currency, budgetTree, addBudgetL1, addBudgetL2, addBudgetL3 } = useStore()
  const t = (key) => translations[language]?.[key] ?? translations.en[key] ?? key
  const symbol = CURRENCY_SYMBOLS[currency] ?? '៛'

  const [level,     setLevel]     = useState(null)   // 'L1' | 'L2' | 'L3'
  const [selL1,     setSelL1]     = useState('')
  const [selL2,     setSelL2]     = useState('')
  const [name,      setName]      = useState('')
  const [code,      setCode]      = useState('')
  const [amount,    setAmount]    = useState('')
  const [errors,    setErrors]    = useState({})

  const selectedL1 = budgetTree.find(n => n.code === selL1)
  const selectedL2 = selectedL1?.children.find(n => n.code === selL2)

  function validate() {
    const e = {}
    if (!name.trim()) e.name = 'Name is required'
    if (!code.trim()) e.code = 'Code is required'
    else if (level === 'L1' && !/^\d{2}$/.test(code))     e.code = 'L1 code must be 2 digits'
    else if (level === 'L2' && !/^\d{4}$/.test(code))     e.code = 'L2 code must be 4 digits'
    else if (level === 'L3' && !/^\d{5}$/.test(code))     e.code = 'L3 code must be 5 digits'
    if (level === 'L2' && !selL1)                         e.parent = 'Select parent L1'
    if (level === 'L3' && (!selL1 || !selL2))             e.parent = 'Select parent L1 and L2'
    if (level === 'L3' && (!amount || Number(amount) <= 0)) e.amount = 'Enter a valid budget amount'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    if (level === 'L1') addBudgetL1({ name: name.trim(), code })
    if (level === 'L2') addBudgetL2(selL1, { name: name.trim(), code })
    if (level === 'L3') addBudgetL3(selL1, selL2, { name: name.trim(), code, budgeted: Number(amount) })
    navigate('/budget')
  }

  // ── Step 1: choose level ─────────────────────────────────────────────────
  if (!level) {
    return (
      <div className="app-shell">
        <PageHeader title={t('newBudget')} />
        <div className="page-content scrollbar-hide p-4 space-y-3">
          <p className="text-[13px] text-[#707070]">Choose the budget level to add:</p>
          {(['L1', 'L2', 'L3']).map(lv => {
            const info = LEVEL_INFO[lv]
            return (
              <button
                key={lv}
                onClick={() => { setLevel(lv); setSelL1(''); setSelL2(''); setName(''); setCode(''); setAmount(''); setErrors({}) }}
                className="w-full bg-white rounded-xl border border-[#E3E5EA] px-4 py-4 flex items-center gap-3 text-left active:opacity-80"
              >
                <div className={`w-10 h-10 rounded-xl ${info.light} flex items-center justify-center flex-shrink-0`}>
                  <span className={`text-[12px] font-bold ${info.text}`}>{lv}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-bold text-[#1F1F1F]">{info.label} — {lv === 'L1' ? 'Department' : lv === 'L2' ? 'Sub-category' : 'Budget Line'}</div>
                  <div className="text-[12px] text-[#707070] mt-0.5">{info.desc}</div>
                </div>
                <ChevronRight size={16} className="text-[#B0B0B0] flex-shrink-0" />
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const info = LEVEL_INFO[level]

  // ── Step 2: form ──────────────────────────────────────────────────────────
  return (
    <div className="app-shell">
      <PageHeader title={`${t('newBudget')} · ${info.label}`} />

      <div className="page-content scrollbar-hide p-4 space-y-4" style={{ paddingBottom: '40px' }}>

        {/* Level badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${info.light}`}>
          <span className={`text-[12px] font-bold ${info.text}`}>{level}</span>
          <span className="text-[12px] text-[#707070]">{info.desc}</span>
        </div>

        {/* Breadcrumb path for L2/L3 */}
        {(level === 'L2' || level === 'L3') && (
          <div>
            <label className="text-[13px] font-semibold text-[#707070] mb-1.5 block">
              Parent L1 — Department
              {errors.parent && <span className="text-[#B12A1B] ml-2">{errors.parent}</span>}
            </label>
            <div className="space-y-1.5 max-h-44 overflow-y-auto scrollbar-hide">
              {budgetTree.map(l1 => (
                <button
                  key={l1.code}
                  onClick={() => { setSelL1(l1.code); setSelL2('') }}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all active:opacity-80 ${
                    selL1 === l1.code ? 'border-[#1E3A8A] bg-[#EAF0FF]' : 'border-[#E3E5EA] bg-white'
                  }`}
                >
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${selL1 === l1.code ? 'bg-[#1E3A8A] text-white' : 'bg-[#F0F0F0] text-[#707070]'}`}>{l1.code}</span>
                  <span className={`text-[13px] font-semibold ${selL1 === l1.code ? 'text-[#1E3A8A]' : 'text-[#1F1F1F]'}`}>{l1.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Parent L2 selector for L3 */}
        {level === 'L3' && selL1 && selectedL1 && (
          <div>
            <label className="text-[13px] font-semibold text-[#707070] mb-1.5 block">Parent L2 — Sub-category</label>
            <div className="space-y-1.5 max-h-44 overflow-y-auto scrollbar-hide">
              {selectedL1.children.map(l2 => (
                <button
                  key={l2.code}
                  onClick={() => setSelL2(l2.code)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all active:opacity-80 ${
                    selL2 === l2.code ? 'border-[#7C3AED] bg-[#F3EEFF]' : 'border-[#E3E5EA] bg-white'
                  }`}
                >
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${selL2 === l2.code ? 'bg-[#7C3AED] text-white' : 'bg-[#F0F0F0] text-[#707070]'}`}>{l2.code}</span>
                  <span className={`text-[13px] font-semibold ${selL2 === l2.code ? 'text-[#7C3AED]' : 'text-[#1F1F1F]'}`}>{l2.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Name */}
        <div>
          <label className="text-[13px] font-semibold text-[#707070] mb-1.5 block">Name</label>
          <input
            type="text"
            placeholder={level === 'L1' ? 'e.g. Logistics' : level === 'L2' ? 'e.g. Warehouse Ops' : 'e.g. Forklift Maintenance'}
            value={name}
            onChange={e => setName(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border text-[14px] text-[#1F1F1F] outline-none focus:border-[#1E3A8A] ${errors.name ? 'border-[#B12A1B]' : 'border-[#E3E5EA]'}`}
          />
          {errors.name && <p className="text-[#B12A1B] text-[11px] mt-1">{errors.name}</p>}
        </div>

        {/* Code */}
        <div>
          <label className="text-[13px] font-semibold text-[#707070] mb-1.5 block">
            Budget Code <span className="text-[#B0B0B0] font-normal">({codeHint(level)})</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={level === 'L1' ? 2 : level === 'L2' ? 4 : 5}
            placeholder={codePlaceholder(level)}
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
            className={`w-full px-4 py-3 rounded-xl border text-[14px] font-mono text-[#1F1F1F] outline-none focus:border-[#1E3A8A] ${errors.code ? 'border-[#B12A1B]' : 'border-[#E3E5EA]'}`}
          />
          {errors.code && <p className="text-[#B12A1B] text-[11px] mt-1">{errors.code}</p>}
        </div>

        {/* Amount — only for L3 */}
        {level === 'L3' && (
          <div>
            <label className="text-[13px] font-semibold text-[#707070] mb-1.5 block">
              Budget Amount <span className="text-[#1E3A8A]">({currency})</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] font-bold text-[#707070]">{symbol}</span>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                placeholder="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className={`w-full pl-8 pr-4 py-3 rounded-xl border text-[14px] font-semibold text-[#1F1F1F] outline-none focus:border-[#1E3A8A] ${errors.amount ? 'border-[#B12A1B]' : 'border-[#E3E5EA]'}`}
              />
            </div>
            {errors.amount && <p className="text-[#B12A1B] text-[11px] mt-1">{errors.amount}</p>}
          </div>
        )}

        {/* Preview */}
        {name && code && (level !== 'L3' || amount) && (
          <div className={`rounded-xl px-4 py-4 ${info.light}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${info.color} text-white font-mono`}>{code}</span>
              {(level === 'L2' || level === 'L3') && selectedL1 && (
                <>
                  <ChevronRight size={12} className="text-[#B0B0B0]" />
                  <span className="text-[11px] text-[#707070]">{selectedL1.name}</span>
                </>
              )}
              {level === 'L3' && selectedL2 && (
                <>
                  <ChevronRight size={12} className="text-[#B0B0B0]" />
                  <span className="text-[11px] text-[#707070]">{selectedL2.name}</span>
                </>
              )}
            </div>
            <div className={`text-[16px] font-bold ${info.text}`}>{name}</div>
            {level === 'L3' && amount && (
              <div className="text-[20px] font-bold text-[#1F1F1F] mt-1">{symbol}{Number(amount).toLocaleString('en-US')}</div>
            )}
          </div>
        )}

        <Button onClick={handleSave}>{t('saveBudget')}</Button>
        <button onClick={() => setLevel(null)} className="w-full text-center text-[13px] text-[#707070] py-2 active:opacity-70">
          ← Change Level
        </button>

      </div>
    </div>
  )
}
