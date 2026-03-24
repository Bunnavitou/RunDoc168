/**
 * Badge / status pill component
 * variant: 'green' | 'amber' | 'red' | 'blue' | 'grey' | 'purple'
 */
export default function Badge({ variant = 'grey', children, className = '' }) {
  const styles = {
    green:  'bg-[#E8F6EF] text-[#1F6F4E]',
    amber:  'bg-[#FFF3DF] text-[#8A6408]',
    red:    'bg-[#FFEDEA] text-[#B12A1B]',
    blue:   'bg-[#E8F0FF] text-[#1E40AF]',
    grey:   'bg-[#F6F6F6] text-[#707070]',
    purple: 'bg-[#EDE9FE] text-[#5B21B6]',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap flex-shrink-0 ${styles[variant] || styles.grey} ${className}`}>
      {children}
    </span>
  )
}

/** Map invoice status → badge variant */
export function invoiceStatusVariant(status) {
  switch (status) {
    case 'paid':      return 'green'
    case 'progress':  return 'blue'
    case 'overdue':   return 'amber'
    case 'cancelled': return 'grey'
    default:          return 'grey'
  }
}

/** Human-readable invoice status */
export function invoiceStatusLabel(status) {
  switch (status) {
    case 'paid':      return 'Paid'
    case 'progress':  return 'In Progress'
    case 'overdue':   return 'Overdue'
    case 'cancelled': return 'Cancelled'
    default:          return status
  }
}
