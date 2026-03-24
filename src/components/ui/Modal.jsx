import { useEffect } from 'react'
import { X } from 'lucide-react'

/**
 * Bottom-sheet modal overlay
 */
export default function Modal({ open, onClose, title, children }) {
  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      className="modal-overlay fade-in"
      onClick={onClose}
    >
      <div
        className="modal-sheet slide-up w-full"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-1">
          <div className="w-8 h-1 bg-[#E3E5EA] rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
          <div />
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full border border-[#E3E5EA] bg-[#F6F6F6] flex items-center justify-center text-[#707070] cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        <div className="px-5 pb-8">
          {title && (
            <h2 className="text-[17px] font-bold text-[#1F1F1F] mb-4">{title}</h2>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}

/** Confirmation modal with primary + cancel buttons */
export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', confirmVariant = 'danger' }) {
  if (!open) return null
  const btnStyle = confirmVariant === 'danger'
    ? 'bg-[#FFEDEA] text-[#B12A1B]'
    : 'bg-[#D64045] text-white'

  return (
    <Modal open={open} onClose={onClose} title={title}>
      {message && <p className="text-[13px] text-[#707070] mb-5 leading-relaxed">{message}</p>}
      <button
        onClick={onConfirm}
        className={`w-full py-3 rounded-[10px] font-semibold text-[15px] ${btnStyle} mb-2`}
      >
        {confirmLabel}
      </button>
      <button
        onClick={onClose}
        className="w-full py-3 rounded-[10px] font-semibold text-[15px] bg-[#F6F6F6] text-[#707070]"
      >
        Cancel
      </button>
    </Modal>
  )
}
