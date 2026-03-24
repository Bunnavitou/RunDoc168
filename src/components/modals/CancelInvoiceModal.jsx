import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { Textarea } from '../ui/Input'

export default function CancelInvoiceModal({ open, onClose, onConfirm }) {
  const [reason, setReason] = useState('')

  function handleConfirm() {
    if (!reason.trim()) return
    onConfirm(reason.trim())
    setReason('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Cancel Invoice">
      <div className="bg-[#FFEDEA] rounded-xl p-3 mb-4">
        <p className="text-[13px] text-[#B12A1B] leading-relaxed">
          This action cannot be undone. The invoice will be marked as cancelled and logged in the audit trail.
        </p>
      </div>

      <Textarea
        label="Cancellation Reason"
        placeholder="e.g. Billing error, duplicate invoice…"
        value={reason}
        onChange={e => setReason(e.target.value)}
        rows={3}
        error={!reason.trim() && reason.length > 0 ? 'Reason is required' : ''}
      />

      <Button variant="danger" onClick={handleConfirm} disabled={!reason.trim()}>
        Confirm Cancellation
      </Button>
    </Modal>
  )
}
