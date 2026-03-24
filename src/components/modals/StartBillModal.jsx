import { useState, useEffect, useMemo } from 'react'
import Modal from '../ui/Modal'
import { useStore } from '../../store'
import { calcInvoiceTotal, generateInvoiceId, calcDueDate, getDaysInMonthByYM } from '../../lib/billing'
import { Droplets, Zap } from 'lucide-react'

// ── helpers ──────────────────────────────────────────────────────────────────

/** Days between two ISO date strings (inclusive) */
function daysBetween(a, b) {
  return Math.max(1, Math.round((new Date(b) - new Date(a)) / 86400000) + 1)
}

/** Days from record date to start-bill date (absolute) */
function daysSinceRecord(recordDateStr, startBillDateStr) {
  const rec   = new Date(recordDateStr)
  const start = new Date(startBillDateStr)
  return Math.abs(Math.round((start - rec) / 86400000))
}

/** "Adjusted" amber badge */
function AdjBadge({ show }) {
  if (!show) return null
  return (
    <span className="text-[10px] font-bold text-[#8A6408] bg-[#FFF3DF] px-1.5 py-0.5 rounded-md">
      adjusted
    </span>
  )
}

/** Inline editable number input (same style as prototype .bli-inp) */
function BliInput({ value, onChange, style = {} }) {
  return (
    <input
      type="number"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-[88px] px-2.5 py-1.5 rounded-lg border-[1.5px] border-[#E3E5EA] text-[13px] font-bold text-right outline-none text-[#1F1F1F] bg-white focus:border-[#D64045]"
      style={style}
    />
  )
}

/** Small inline rate input (used inside usage row) */
function RateInput({ value, onChange }) {
  return (
    <input
      type="number"
      step="0.01"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-[46px] border-[1.5px] border-[#E3E5EA] rounded-md px-1 py-0.5 text-[11px] font-bold outline-none bg-white focus:border-[#D64045] text-right"
    />
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StartBillModal({ open, onClose, roomId, onSuccess }) {
  const {
    rooms, buildings, floors, tenants, contracts, exchangeRate,
    getActiveContract, getRoomServices, getLastMeterReading, createInvoice,
  } = useStore()

  const room      = rooms.find(r => r.id === roomId)
  const contract  = getActiveContract(roomId)
  const tenant    = contract ? tenants.find(t => t.id === contract.tenantId) : null
  const floor     = floors.find(f => f.id === room?.floorId)
  const building  = buildings.find(b => b.id === room?.buildingId)
  const lastRec   = getLastMeterReading(roomId)
  const roomSvcs  = getRoomServices(roomId)

  // Defaults
  const today        = new Date()
  const defaultStart = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-01`
  const defaultEnd   = new Date(today.getFullYear(), today.getMonth()+1, 0).toISOString().split('T')[0]

  // ── form state ──
  const [periodStart, setPeriodStart] = useState(defaultStart)
  const [periodEnd,   setPeriodEnd]   = useState(defaultEnd)
  const [dueOption,   setDueOption]   = useState(14)           // prototype default = +14

  // Rent
  const defaultRent = contract?.baseRent ?? 0
  const [rent, setRent]   = useState(String(defaultRent))

  // Water
  const defaultWaterRate = roomSvcs.find(s=>s.serviceId==='water')?.effectiveRate ?? 0.28
  const [waterPrev,    setWaterPrev]    = useState('')
  const [waterCurrent, setWaterCurrent] = useState('')
  const [waterRate,    setWaterRate]    = useState(String(defaultWaterRate))
  const [waterAutoFilled, setWaterAutoFilled] = useState(false)

  // Electricity
  const defaultElecRate = roomSvcs.find(s=>s.serviceId==='elec')?.effectiveRate ?? 0.12
  const [elecPrev,    setElecPrev]    = useState('')
  const [elecCurrent, setElecCurrent] = useState('')
  const [elecRate,    setElecRate]    = useState(String(defaultElecRate))
  const [elecAutoFilled, setElecAutoFilled] = useState(false)

  // Fixed services: [{ serviceId, name, default, value }]
  const fixedSvcs = roomSvcs.filter(s => s.serviceId !== 'water' && s.serviceId !== 'elec')
  const [svcAmounts, setSvcAmounts] = useState({})

  const [errors, setErrors] = useState({})

  // ── init / reset on open ─────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return

    const startDate = defaultStart

    // Reset dates
    setPeriodStart(startDate)
    setPeriodEnd(defaultEnd)
    setDueOption(14)
    setErrors({})

    // Rent
    const baseRent = contract?.baseRent ?? 0
    setRent(String(baseRent))

    // Water / Electricity auto-fill logic:
    // Auto-fill if lastRecord date is within 20 days of start bill date
    const waterDef = roomSvcs.find(s=>s.serviceId==='water')?.effectiveRate ?? 0.28
    const elecDef  = roomSvcs.find(s=>s.serviceId==='elec')?.effectiveRate ?? 0.12
    setWaterRate(String(waterDef))
    setElecRate(String(elecDef))

    if (lastRec) {
      const dayDiff = daysSinceRecord(lastRec.date, startDate)
      const autoFill = dayDiff <= 20

      setWaterPrev(String(lastRec.waterCurrent))    // prev = last record's current
      setElecPrev(String(lastRec.elecCurrent))

      if (autoFill) {
        setWaterCurrent(String(lastRec.waterCurrent))
        setElecCurrent(String(lastRec.elecCurrent))
        setWaterAutoFilled(true)
        setElecAutoFilled(true)
      } else {
        setWaterCurrent('')
        setElecCurrent('')
        setWaterAutoFilled(false)
        setElecAutoFilled(false)
      }
    } else {
      setWaterPrev('0')
      setElecPrev('0')
      setWaterCurrent('')
      setElecCurrent('')
      setWaterAutoFilled(false)
      setElecAutoFilled(false)
    }

    // Fixed services — pre-fill with effective rates
    const init = {}
    fixedSvcs.forEach(s => { init[s.serviceId] = String(s.effectiveRate) })
    setSvcAmounts(init)
  }, [open, roomId]) // eslint-disable-line

  // Re-compute auto-fill when period start changes
  useEffect(() => {
    if (!open || !lastRec) return
    const dayDiff = daysSinceRecord(lastRec.date, periodStart)
    const autoFill = dayDiff <= 20
    setWaterPrev(String(lastRec.waterCurrent))
    setElecPrev(String(lastRec.elecCurrent))
    if (autoFill) {
      setWaterCurrent(String(lastRec.waterCurrent))
      setElecCurrent(String(lastRec.elecCurrent))
      setWaterAutoFilled(true)
      setElecAutoFilled(true)
    } else {
      setWaterAutoFilled(false)
      setElecAutoFilled(false)
    }
  }, [periodStart, open]) // eslint-disable-line

  // ── computed values ──────────────────────────────────────────────────────
  const billDays = useMemo(() => daysBetween(periodStart, periodEnd), [periodStart, periodEnd])

  const daysInMonth = useMemo(() => {
    const d = new Date(periodStart)
    return getDaysInMonthByYM(d.getFullYear(), d.getMonth() + 1)
  }, [periodStart])

  const waterUsage = Math.max(0, (parseFloat(waterCurrent) || 0) - (parseFloat(waterPrev) || 0))
  const elecUsage  = Math.max(0, (parseFloat(elecCurrent)  || 0) - (parseFloat(elecPrev)  || 0))
  const waterAmt   = waterUsage * (parseFloat(waterRate) || 0)
  const elecAmt    = elecUsage  * (parseFloat(elecRate)  || 0)
  const rentAmt    = (parseFloat(rent) || 0) * (billDays / daysInMonth)
  const fixedTotal = fixedSvcs.reduce((sum, s) => sum + (parseFloat(svcAmounts[s.serviceId]) || 0), 0)
  const grandTotal = rentAmt + waterAmt + elecAmt + fixedTotal

  // Adjusted badges
  const rentDefault = contract?.baseRent ?? 0
  const wRateDefault = roomSvcs.find(s=>s.serviceId==='water')?.effectiveRate ?? 0.28
  const eRateDefault = roomSvcs.find(s=>s.serviceId==='elec')?.effectiveRate  ?? 0.12

  // Formatted period label e.g. "1–31 Mar 2026"
  const periodLabel = useMemo(() => {
    const s = new Date(periodStart)
    const e = new Date(periodEnd)
    const sDay = s.getDate()
    const eDay = e.getDate()
    const mon  = s.toLocaleDateString('en-US', { month: 'short' })
    const yr   = s.getFullYear()
    return `${sDay}–${eDay} ${mon} ${yr}`
  }, [periodStart, periodEnd])

  // Last record label e.g. "Last record: 11 Mar"
  const lastRecLabel = lastRec
    ? `Last record: ${new Date(lastRec.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`
    : 'No record'

  // Due date computed from today
  const dueDateDisplay = useMemo(() => {
    const due = new Date(today)
    due.setDate(due.getDate() + dueOption)
    return due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }, [dueOption])

  // ── validation + submit ──────────────────────────────────────────────────
  function validate() {
    const errs = {}
    if (!rent || parseFloat(rent) < 0)          errs.rent  = 'Required'
    if (!waterCurrent)                            errs.wc    = 'Enter current reading'
    else if (parseFloat(waterCurrent) < parseFloat(waterPrev||'0'))
                                                  errs.wc    = `Cannot be less than ${waterPrev}`
    if (!elecCurrent)                             errs.ec    = 'Enter current reading'
    else if (parseFloat(elecCurrent) < parseFloat(elecPrev||'0'))
                                                  errs.ec    = `Cannot be less than ${elecPrev}`
    return errs
  }

  function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const invoiceId = generateInvoiceId(periodStart, roomId)
    const dueDate   = calcDueDate(today.toISOString().split('T')[0], dueOption)

    createInvoice({
      id: invoiceId,
      roomId,
      contractId: contract?.id,
      tenantSnapshot: { name: tenant?.name || '', phone: tenant?.phone || '' },
      roomSnapshot:   { name: room?.name || '', building: building?.name || '', floor: floor?.name || '' },
      periodStart,
      periodEnd,
      dueDate,
      baseRent:      parseFloat(rent),
      waterPrev:     parseFloat(waterPrev) || 0,
      waterCurrent:  parseFloat(waterCurrent),
      waterRate:     parseFloat(waterRate) || 0,
      elecPrev:      parseFloat(elecPrev) || 0,
      elecCurrent:   parseFloat(elecCurrent),
      elecRate:      parseFloat(elecRate) || 0,
      fixedServices: fixedSvcs.map(s => ({
        serviceId: s.serviceId,
        name:      s.name,
        amount:    parseFloat(svcAmounts[s.serviceId]) || 0,
      })),
      securityDeposit: contract?.securityDeposit || 0,
      subtotal: grandTotal,
      total:    grandTotal,
      exchangeRate,
    })

    onSuccess?.()
    onClose()
  }

  if (!room || !contract || !tenant) return null

  // ── render ───────────────────────────────────────────────────────────────
  return (
    <Modal open={open} onClose={onClose} title={`Start Bill — ${room.name}`}>

      {/* ── Bill Period ───────────────────────────────── */}
      <div className="text-[11px] font-semibold text-[#707070] uppercase tracking-[0.5px] mb-1.5">
        Bill Period
      </div>
      <div className="flex gap-2 mb-2">
        <div className="flex-1">
          <label className="text-[10px] text-[#707070] mb-1 block">Start Date</label>
          <input
            type="date"
            value={periodStart}
            onChange={e => setPeriodStart(e.target.value)}
            className="input-base text-[13px] py-2"
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-[#707070] mb-1 block">End Date</label>
          <input
            type="date"
            value={periodEnd}
            onChange={e => setPeriodEnd(e.target.value)}
            className="input-base text-[13px] py-2"
          />
        </div>
      </div>
      {/* Pink info bar */}
      <div className="bg-[#FFEDEA] border border-[#FFEDEA] rounded-lg px-3 py-2 mb-3 text-[12px] font-bold text-[#D64045]">
        <span>{billDays} days selected</span>
        <span className="text-[#707070] font-normal mx-1">·</span>
        <span>Rental = ${(parseFloat(rent)||0).toFixed(2)} × {billDays}/{daysInMonth}</span>
      </div>

      {/* ── Due Date ──────────────────────────────────── */}
      <div className="text-[11px] font-semibold text-[#707070] uppercase tracking-[0.5px] mb-1.5">
        Due Date
      </div>
      <div className="flex gap-2 mb-1">
        {[7, 14, 30].map(d => (
          <button
            key={d}
            onClick={() => setDueOption(d)}
            className={`flex-1 py-2 rounded-lg border-[1.5px] text-[13px] font-semibold transition-colors ${
              dueOption === d
                ? 'border-[#D64045] bg-[#FFEDEA] text-[#D64045]'
                : 'border-[#E3E5EA] bg-white text-[#707070]'
            }`}
          >
            +{d} days
          </button>
        ))}
      </div>
      <div className="text-[11px] text-[#707070] mb-3 pl-0.5">
        Due date applied after invoice is in progress · <span className="font-semibold">{dueDateDisplay}</span>
      </div>

      {/* ── Room Rental Fee ───────────────────────────── */}
      <div className="bg-[#F6F6F6] rounded-lg p-3 mb-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] font-bold text-[#1F1F1F]">Room Rental Fee</div>
            <div className="text-[11px] text-[#707070] mt-0.5">{billDays} days · {periodLabel}</div>
          </div>
          <div className="flex items-center gap-1.5">
            <AdjBadge show={parseFloat(rent) !== rentDefault} />
            <BliInput
              value={rent}
              onChange={v => { setRent(v); setErrors(p => ({...p, rent:''})) }}
            />
          </div>
        </div>
        {errors.rent && <p className="text-[11px] text-[#B12A1B] mt-1">{errors.rent}</p>}
      </div>

      {/* ── Water Meter ───────────────────────────────── */}
      <div className="bg-[#F6F6F6] rounded-lg p-3 mb-2">
        {/* Header row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#1F1F1F]">
            <Droplets size={14} className="text-[#1A7ACC]" />
            Water Meter
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#707070]">{lastRecLabel}</span>
            {waterAutoFilled ? (
              <span className="text-[9px] font-bold text-[#D64045] bg-[#FFEDEA] px-1.5 py-0.5 rounded">
                Auto-filled
              </span>
            ) : lastRec ? (
              <button
                onClick={() => {
                  setWaterPrev(String(lastRec.waterCurrent))
                  setWaterCurrent(String(lastRec.waterCurrent))
                }}
                className="text-[12px] font-semibold text-[#D64045] bg-[#FFEDEA] border border-[#D64045] px-2 py-1 rounded-lg leading-none"
              >
                Use Last
              </button>
            ) : null}
          </div>
        </div>

        {/* Prev + Current inputs */}
        <div className="flex gap-2 mb-2">
          <div className="flex-1">
            <div className="text-[10px] text-[#707070] mb-1">Prev Reading</div>
            <input
              type="number"
              value={waterPrev}
              onChange={e => setWaterPrev(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border-[1.5px] border-[#E3E5EA] text-[13px] font-bold text-right outline-none bg-white focus:border-[#D64045]"
            />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <div className="text-[10px] text-[#707070]">Current Reading</div>
            </div>
            <input
              type="number"
              value={waterCurrent}
              placeholder="Enter reading"
              onChange={e => { setWaterCurrent(e.target.value); setErrors(p=>({...p,wc:''})) }}
              className={`w-full px-2.5 py-1.5 rounded-lg border-[1.5px] text-[13px] font-bold text-right outline-none bg-white focus:border-[#D64045] ${errors.wc ? 'border-[#B12A1B]' : 'border-[#E3E5EA]'}`}
            />
          </div>
        </div>
        {errors.wc && <p className="text-[11px] text-[#B12A1B] -mt-1 mb-1.5">{errors.wc}</p>}

        {/* Usage + Rate row */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[#707070]">
            Usage: <b className="text-[#1F1F1F]">{waterUsage}</b> m³ × $
            <RateInput
              value={waterRate}
              onChange={setWaterRate}
            />
            {' '}/m³
          </span>
          <div className="flex items-center gap-1.5">
            <AdjBadge show={Math.abs(parseFloat(waterRate) - wRateDefault) > 0.0001} />
            <span className="text-[12px] font-bold text-[#D64045]">${waterAmt.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* ── Electricity Meter ─────────────────────────── */}
      <div className="bg-[#F6F6F6] rounded-lg p-3 mb-2">
        {/* Header row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#1F1F1F]">
            <Zap size={14} className="text-[#B8860B]" />
            Electricity Meter
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#707070]">{lastRecLabel}</span>
            {elecAutoFilled ? (
              <span className="text-[9px] font-bold text-[#D64045] bg-[#FFEDEA] px-1.5 py-0.5 rounded">
                Auto-filled
              </span>
            ) : lastRec ? (
              <button
                onClick={() => {
                  setElecPrev(String(lastRec.elecCurrent))
                  setElecCurrent(String(lastRec.elecCurrent))
                }}
                className="text-[12px] font-semibold text-[#D64045] bg-[#FFEDEA] border border-[#D64045] px-2 py-1 rounded-lg leading-none"
              >
                Use Last
              </button>
            ) : null}
          </div>
        </div>

        {/* Prev + Current inputs */}
        <div className="flex gap-2 mb-2">
          <div className="flex-1">
            <div className="text-[10px] text-[#707070] mb-1">Prev Reading</div>
            <input
              type="number"
              value={elecPrev}
              onChange={e => setElecPrev(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border-[1.5px] border-[#E3E5EA] text-[13px] font-bold text-right outline-none bg-white focus:border-[#D64045]"
            />
          </div>
          <div className="flex-1">
            <div className="text-[10px] text-[#707070] mb-1">Current Reading</div>
            <input
              type="number"
              value={elecCurrent}
              placeholder="Enter reading"
              onChange={e => { setElecCurrent(e.target.value); setErrors(p=>({...p,ec:''})) }}
              className={`w-full px-2.5 py-1.5 rounded-lg border-[1.5px] text-[13px] font-bold text-right outline-none bg-white focus:border-[#D64045] ${errors.ec ? 'border-[#B12A1B]' : 'border-[#E3E5EA]'}`}
            />
          </div>
        </div>
        {errors.ec && <p className="text-[11px] text-[#B12A1B] -mt-1 mb-1.5">{errors.ec}</p>}

        {/* Usage + Rate row */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[#707070]">
            Usage: <b className="text-[#1F1F1F]">{elecUsage}</b> kWh × $
            <RateInput
              value={elecRate}
              onChange={setElecRate}
            />
            {' '}/kWh
          </span>
          <div className="flex items-center gap-1.5">
            <AdjBadge show={Math.abs(parseFloat(elecRate) - eRateDefault) > 0.0001} />
            <span className="text-[12px] font-bold text-[#D64045]">${elecAmt.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* ── Active Services ───────────────────────────── */}
      {fixedSvcs.length > 0 && (
        <>
          <div className="text-[11px] font-semibold text-[#707070] uppercase tracking-[0.5px] mt-3 mb-1.5">
            Active Services
          </div>
          {fixedSvcs.map(svc => {
            const val     = svcAmounts[svc.serviceId] ?? String(svc.effectiveRate)
            const defVal  = svc.effectiveRate
            const isAdj   = Math.abs(parseFloat(val) - defVal) > 0.001

            return (
              <div key={svc.serviceId} className="bg-[#F6F6F6] rounded-lg p-3 mb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-bold text-[#1F1F1F]">{svc.name}</div>
                    <div className="text-[11px] text-[#707070] mt-0.5">Fixed · assigned to room</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <AdjBadge show={isAdj} />
                    <BliInput
                      value={val}
                      onChange={v => setSvcAmounts(p => ({ ...p, [svc.serviceId]: v }))}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </>
      )}

      {/* ── Total ─────────────────────────────────────── */}
      <div className="bg-[#FFEDEA] border border-[#FFEDEA] rounded-lg px-3.5 py-3 my-3">
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-bold text-[#1F1F1F]">Total</span>
          <span className="text-[20px] font-bold text-[#D64045]">${grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* ── Submit ────────────────────────────────────── */}
      <button
        onClick={handleSubmit}
        className="w-full py-3.5 bg-[#D64045] text-white text-[15px] font-semibold rounded-[10px] active:opacity-85 hover:bg-[#B7353A] transition-colors"
      >
        Submit
      </button>
    </Modal>
  )
}
