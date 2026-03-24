import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { Droplets, Zap } from 'lucide-react'

export default function AddMeterModal({ open, onClose, onConfirm, lastReading }) {
  const today = new Date().toISOString().split('T')[0]

  const [date, setDate] = useState(today)
  const [waterCurrent, setWaterCurrent] = useState('')
  const [elecCurrent, setElecCurrent] = useState('')
  const [errors, setErrors] = useState({})

  const waterPrev = lastReading?.waterCurrent ?? 0
  const elecPrev = lastReading?.elecCurrent ?? 0

  function validate() {
    const errs = {}
    const wc = parseFloat(waterCurrent)
    const ec = parseFloat(elecCurrent)
    if (!waterCurrent) errs.water = 'Current reading is required'
    else if (wc < waterPrev) errs.water = `Reading cannot be less than previous (${waterPrev})`
    if (!elecCurrent) errs.elec = 'Current reading is required'
    else if (ec < elecPrev) errs.elec = `Reading cannot be less than previous (${elecPrev})`
    return errs
  }

  function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onConfirm({
      date,
      recorder: 'Manager',
      waterPrev,
      waterCurrent: parseFloat(waterCurrent),
      elecPrev,
      elecCurrent: parseFloat(elecCurrent),
    })
    setWaterCurrent('')
    setElecCurrent('')
    setErrors({})
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="New Meter Record">
      <Input
        label="Date"
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        className="mb-4"
      />

      {/* Water */}
      <div className="bg-[#EEF7F8] rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-[#EAF3FF] flex items-center justify-center">
            <Droplets size={14} className="text-[#1A5FA5]" />
          </div>
          <span className="text-[13px] font-bold text-[#1F1F1F]">Water (m³)</span>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-[11px] font-semibold text-[#707070] mb-1 block">Previous</label>
            <input
              className="input-base bg-[#F6F6F6] text-[#707070]"
              value={waterPrev}
              readOnly
            />
          </div>
          <div className="flex-1">
            <label className="text-[11px] font-semibold text-[#707070] mb-1 block">Current</label>
            <input
              type="number"
              className={`input-base ${errors.water ? 'border-[#B12A1B]' : ''}`}
              placeholder="Enter reading"
              value={waterCurrent}
              onChange={e => { setWaterCurrent(e.target.value); setErrors(p => ({ ...p, water: '' })) }}
            />
          </div>
          <div className="flex-1">
            <label className="text-[11px] font-semibold text-[#707070] mb-1 block">Usage</label>
            <div className="input-base bg-[#FFEDEA] text-[#D64045] font-bold">
              +{Math.max(0, (parseFloat(waterCurrent) || 0) - waterPrev)}
            </div>
          </div>
        </div>
        {errors.water && <p className="text-[11px] text-[#B12A1B] mt-1">{errors.water}</p>}
      </div>

      {/* Electricity */}
      <div className="bg-[#FFF8E6] rounded-xl p-3 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-[#FFF3DF] flex items-center justify-center">
            <Zap size={14} className="text-[#8A6408]" />
          </div>
          <span className="text-[13px] font-bold text-[#1F1F1F]">Electricity (kWh)</span>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-[11px] font-semibold text-[#707070] mb-1 block">Previous</label>
            <input
              className="input-base bg-[#F6F6F6] text-[#707070]"
              value={elecPrev}
              readOnly
            />
          </div>
          <div className="flex-1">
            <label className="text-[11px] font-semibold text-[#707070] mb-1 block">Current</label>
            <input
              type="number"
              className={`input-base ${errors.elec ? 'border-[#B12A1B]' : ''}`}
              placeholder="Enter reading"
              value={elecCurrent}
              onChange={e => { setElecCurrent(e.target.value); setErrors(p => ({ ...p, elec: '' })) }}
            />
          </div>
          <div className="flex-1">
            <label className="text-[11px] font-semibold text-[#707070] mb-1 block">Usage</label>
            <div className="input-base bg-[#FFEDEA] text-[#D64045] font-bold">
              +{Math.max(0, (parseFloat(elecCurrent) || 0) - elecPrev)}
            </div>
          </div>
        </div>
        {errors.elec && <p className="text-[11px] text-[#B12A1B] mt-1">{errors.elec}</p>}
      </div>

      <Button onClick={handleSubmit}>Save Record</Button>
    </Modal>
  )
}
