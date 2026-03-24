export default function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="text-center py-8 px-4">
      {icon && (
        <div className="flex justify-center mb-3 text-[#E3E5EA]">
          {icon}
        </div>
      )}
      {title && (
        <div className="text-[14px] font-bold text-[#1F1F1F] mb-1">{title}</div>
      )}
      {subtitle && (
        <div className="text-[12px] text-[#707070] leading-relaxed">{subtitle}</div>
      )}
      {action && (
        <div className="mt-4">{action}</div>
      )}
    </div>
  )
}
