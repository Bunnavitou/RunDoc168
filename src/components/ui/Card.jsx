export default function Card({ children, className = '', onClick, padding = true }) {
  return (
    <div
      className={`bg-white rounded-xl border border-[#E3E5EA] shadow-[0_1px_3px_rgba(0,0,0,0.05)] ${padding ? 'p-4' : ''} ${onClick ? 'cursor-pointer active:opacity-80' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

/** Horizontal divider used inside cards */
export function Divider({ className = '' }) {
  return <div className={`h-px bg-[#E3E5EA] ${className}`} />
}

/** Section label (ALL CAPS small text) */
export function SectionLabel({ children, className = '' }) {
  return (
    <div className={`text-[11px] font-semibold text-[#707070] uppercase tracking-[0.5px] my-3 first:mt-0 ${className}`}>
      {children}
    </div>
  )
}
