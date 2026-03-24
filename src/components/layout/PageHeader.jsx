import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

/**
 * Page header with optional back button + right action slot
 */
export default function PageHeader({ title, subtitle, onBack, rightSlot, backTo }) {
  const navigate = useNavigate()

  function handleBack() {
    if (onBack) return onBack()
    if (backTo) return navigate(backTo)
    navigate(-1)
  }

  return (
    <div className="bg-white border-b border-[#E3E5EA] flex-shrink-0">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          {(onBack !== false) && (
            <button
              onClick={handleBack}
              className="w-8 h-8 rounded-full bg-[#F6F6F6] flex items-center justify-center flex-shrink-0"
            >
              <ChevronLeft size={18} className="text-[#1F1F1F]" />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-[20px] font-bold text-[#1F1F1F] leading-tight truncate">{title}</h1>
            {subtitle && (
              <div className="text-[12px] text-[#707070]">{subtitle}</div>
            )}
          </div>
        </div>
        {rightSlot && (
          <div className="flex-shrink-0 ml-2">{rightSlot}</div>
        )}
      </div>
    </div>
  )
}
