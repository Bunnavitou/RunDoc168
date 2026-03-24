import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { useStore } from '../../store'
import { Search, CheckCircle, UserPlus } from 'lucide-react'

// Step 1: phone lookup
// Step 2a: found existing tenant — confirm
// Step 2b: new tenant — fill details
// Step 3 (shared): move-in date + security deposit

export default function AddTenantModal({ open, onClose, roomId, roomName }) {
  const lookupTenantByPhone = useStore(s => s.lookupTenantByPhone)
  const addTenant = useStore(s => s.addTenant)
  const addTenantToRoom = useStore(s => s.addTenantToRoom)

  const [step, setStep] = useState('phone') // 'phone' | 'found' | 'new' | 'contract'
  const [phone, setPhone] = useState('')
  const [foundTenant, setFoundTenant] = useState(null)
  const [newName, setNewName] = useState('')
  const [moveInDate, setMoveInDate] = useState(new Date().toISOString().split('T')[0])
  const [securityDeposit, setSecurityDeposit] = useState('')
  const [errors, setErrors] = useState({})

  function reset() {
    setStep('phone')
    setPhone('')
    setFoundTenant(null)
    setNewName('')
    setMoveInDate(new Date().toISOString().split('T')[0])
    setSecurityDeposit('')
    setErrors({})
  }

  function handleLookup() {
    if (!phone.trim()) { setErrors({ phone: 'Enter a phone number' }); return }
    const found = lookupTenantByPhone(phone)
    if (found) {
      setFoundTenant(found)
      setStep('found')
    } else {
      setStep('new')
    }
    setErrors({})
  }

  function handleConfirmFound() {
    setStep('contract')
  }

  function handleNewNext() {
    if (!newName.trim()) { setErrors({ name: 'Name is required' }); return }
    setErrors({})
    setStep('contract')
  }

  function handleFinalSubmit() {
    const errs = {}
    if (!moveInDate) errs.moveIn = 'Move-in date is required'
    if (!securityDeposit || parseFloat(securityDeposit) < 0) errs.deposit = 'Security deposit is required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    // Upsert tenant
    let tenant = foundTenant
    if (!tenant) {
      tenant = addTenant({ name: newName.trim(), phone: phone.trim() })
    }

    addTenantToRoom(roomId, tenant.id, {
      startDate: moveInDate,
      endDate: null,
      baseRent: 0,
      securityDeposit: parseFloat(securityDeposit),
    }, ['water', 'elec'])

    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={() => { reset(); onClose() }} title="Add Tenant">

      {/* Step: Phone lookup */}
      {step === 'phone' && (
        <div>
          <p className="text-[13px] text-[#707070] mb-4">
            Enter the tenant's phone number to check if they already exist in the system.
          </p>
          <Input
            label="Phone Number"
            type="tel"
            placeholder="e.g. 081-234-5678"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            error={errors.phone}
            onKeyDown={e => e.key === 'Enter' && handleLookup()}
          />
          <Button onClick={handleLookup}>
            <Search size={16} /> Look Up
          </Button>
        </div>
      )}

      {/* Step: Existing tenant found */}
      {step === 'found' && foundTenant && (
        <div>
          <div className="flex items-center gap-2 text-[#1F6F4E] bg-[#E8F6EF] rounded-xl p-3 mb-4">
            <CheckCircle size={18} />
            <span className="text-[13px] font-semibold">Existing tenant found</span>
          </div>
          <div className="bg-[#F6F6F6] rounded-xl p-4 mb-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#E8F0FF] flex items-center justify-center text-[#2563EB] font-bold text-[18px]">
              {foundTenant.name[0]}
            </div>
            <div>
              <div className="text-[15px] font-bold text-[#1F1F1F]">{foundTenant.name}</div>
              <div className="text-[13px] text-[#707070]">{foundTenant.phone}</div>
            </div>
          </div>
          <Button onClick={handleConfirmFound}>Confirm & Continue</Button>
          <button onClick={() => setStep('phone')} className="w-full text-center text-[13px] text-[#707070] mt-3 py-2">
            Use a different number
          </button>
        </div>
      )}

      {/* Step: New tenant */}
      {step === 'new' && (
        <div>
          <div className="flex items-center gap-2 text-[#1E40AF] bg-[#E8F0FF] rounded-xl p-3 mb-4">
            <UserPlus size={18} />
            <span className="text-[13px] font-semibold">No match found — create new tenant</span>
          </div>
          <div className="bg-[#F6F6F6] rounded-xl p-3 mb-3 text-[13px] text-[#707070]">
            Phone: <span className="font-bold text-[#1F1F1F]">{phone}</span>
          </div>
          <Input
            label="Full Name"
            placeholder="e.g. Somchai Kongchai"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            error={errors.name}
          />
          <Button onClick={handleNewNext}>Next</Button>
          <button onClick={() => setStep('phone')} className="w-full text-center text-[13px] text-[#707070] mt-3 py-2">
            Back
          </button>
        </div>
      )}

      {/* Step: Contract details */}
      {step === 'contract' && (
        <div>
          <div className="text-[13px] font-semibold text-[#707070] mb-3">
            Contract for {roomName}
          </div>
          <Input
            label="Move-In Date"
            type="date"
            value={moveInDate}
            onChange={e => setMoveInDate(e.target.value)}
            error={errors.moveIn}
          />
          <Input
            label="Security Deposit ($)"
            type="number"
            step="0.01"
            placeholder="e.g. 1300"
            value={securityDeposit}
            onChange={e => setSecurityDeposit(e.target.value)}
            error={errors.deposit}
          />
          <div className="bg-[#FFF3DF] rounded-xl p-3 mb-4">
            <p className="text-[12px] text-[#8A6408]">
              You can set the base rent and additional services from the Room Detail page after adding the tenant.
            </p>
          </div>
          <Button onClick={handleFinalSubmit}>Confirm & Add Tenant</Button>
          <button onClick={() => setStep(foundTenant ? 'found' : 'new')} className="w-full text-center text-[13px] text-[#707070] mt-3 py-2">
            Back
          </button>
        </div>
      )}
    </Modal>
  )
}
