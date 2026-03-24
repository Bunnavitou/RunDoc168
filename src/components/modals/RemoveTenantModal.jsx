import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { Textarea } from '../ui/Input'

export default function RemoveTenantModal({ open, onClose, onConfirm, tenantName, roomName }) {
  const [reason, setReason] = useState('')

  function handleConfirm() {
    if (!reason.trim()) return
    onConfirm(reason.trim())
    setReason('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Remove Tenant">
      <div className="mb-4">
        <div className="text-[14px] font-bold text-[#1F1F1F] mb-1">
          Remove {tenantName} from {roomName}?
        </div>
        <div className="text-[13px] text-[#707070] leading-relaxed">
          This will terminate the contract for this room. The action is logged and cannot be undone. Any open invoices must be resolved separately.
        </div>
      </div>

      <Textarea
        label="Termination Reason"
        placeholder="e.g. Lease ended, tenant moved out…"
        value={reason}
        onChange={e => setReason(e.target.value)}
        rows={3}
      />

      <Button variant="danger" onClick={handleConfirm} disabled={!reason.trim()}>
        Confirm Remove
      </Button>
    </Modal>
  )
}
