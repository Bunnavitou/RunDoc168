import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { Banknote, QrCode } from 'lucide-react'

export default function MarkPaidModal({ open, onClose, onConfirm }) {
  const [method, setMethod] = useState(null)

  function handleConfirm() {
    if (!method) return
    onConfirm(method)
    setMethod(null)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Mark as Paid">
      <p className="text-[13px] text-[#707070] mb-4">Select the payment method used by the tenant.</p>

      <div className="flex gap-3 mb-5">
        <button
          onClick={() => setMethod('Cash')}
          className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-colors ${
            method === 'Cash'
              ? 'border-[#D64045] bg-[#FFEDEA] text-[#D64045]'
              : 'border-[#E3E5EA] bg-white text-[#707070]'
          }`}
        >
          <Banknote size={24} />
          <span className="text-[13px] font-semibold">Cash</span>
        </button>

        <button
          onClick={() => setMethod('QR Transfer')}
          className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-colors ${
            method === 'QR Transfer'
              ? 'border-[#D64045] bg-[#FFEDEA] text-[#D64045]'
              : 'border-[#E3E5EA] bg-white text-[#707070]'
          }`}
        >
          <QrCode size={24} />
          <span className="text-[13px] font-semibold">QR Transfer</span>
        </button>
      </div>

      <Button onClick={handleConfirm} disabled={!method}>
        Confirm Payment
      </Button>
    </Modal>
  )
}
