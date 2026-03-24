import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import PageHeader from '../components/layout/PageHeader'
import {
  CheckCircle2, XCircle, AlertCircle, FileText,
  Droplets, UserPlus, Plus, Edit2, Trash2, BellOff,
} from 'lucide-react'

// ── Notification type config ──────────────────────────────────────────────────
const TYPE_CONFIG = {
  invoice_paid:      { icon: CheckCircle2, iconBg: 'bg-[#E8F6EF]', iconColor: 'text-[#1F6F4E]', dot: 'bg-[#22C55E]' },
  invoice_overdue:   { icon: AlertCircle,  iconBg: 'bg-[#FFEDEA]', iconColor: 'text-[#B12A1B]', dot: 'bg-[#2563EB]' },
  invoice_cancelled: { icon: XCircle,      iconBg: 'bg-[#FFEDEA]', iconColor: 'text-[#B12A1B]', dot: 'bg-[#2563EB]' },
  bill_started:      { icon: FileText,     iconBg: 'bg-[#E8F0FF]', iconColor: 'text-[#1E40AF]', dot: 'bg-[#1E40AF]' },
  meter_recorded:    { icon: Droplets,     iconBg: 'bg-[#E8F0FF]', iconColor: 'text-[#1E40AF]', dot: 'bg-[#1E40AF]' },
  sub_user_added:    { icon: UserPlus,     iconBg: 'bg-[#F3EEFF]', iconColor: 'text-[#6B3FA0]', dot: 'bg-[#6B3FA0]' },
  service_added:     { icon: Plus,         iconBg: 'bg-[#E8F6EF]', iconColor: 'text-[#1F6F4E]', dot: 'bg-[#22C55E]' },
  service_edited:    { icon: Edit2,        iconBg: 'bg-[#FFF3DF]', iconColor: 'text-[#8A6408]', dot: 'bg-[#F59E0B]' },
  service_deleted:   { icon: Trash2,       iconBg: 'bg-[#FFEDEA]', iconColor: 'text-[#B12A1B]', dot: 'bg-[#2563EB]' },
}

function getConfig(type) {
  return TYPE_CONFIG[type] || { icon: FileText, iconBg: 'bg-[#F6F6F6]', iconColor: 'text-[#707070]', dot: 'bg-[#B0B0B0]' }
}

// ── Time ago ──────────────────────────────────────────────────────────────────
function timeAgo(isoStr) {
  const diff = Date.now() - new Date(isoStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)    return 'Just now'
  if (mins < 60)   return `${mins}m ago`
  if (hours < 24)  return `${hours}h ago`
  if (days < 7)    return `${days}d ago`
  return new Date(isoStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Group by date ─────────────────────────────────────────────────────────────
function groupByDate(notifications) {
  const groups = {}
  notifications.forEach(n => {
    const d = new Date(n.createdAt)
    const today    = new Date()
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
    let label
    if (d.toDateString() === today.toDateString())     label = 'Today'
    else if (d.toDateString() === yesterday.toDateString()) label = 'Yesterday'
    else label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    if (!groups[label]) groups[label] = []
    groups[label].push(n)
  })
  return groups
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Notifications() {
  const navigate = useNavigate()
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    flagOverdueInvoices,
  } = useStore()

  // Auto-flag any newly overdue invoices on mount
  useEffect(() => { flagOverdueInvoices() }, [])

  const unreadCount = notifications.filter(n => !n.read).length
  const groups = groupByDate(notifications)

  function handleTap(notif) {
    markNotificationRead(notif.id)
    if (notif.ref?.startsWith('INV-')) navigate(`/invoice/${notif.ref}`)
  }

  return (
    <div className="app-shell">
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        rightSlot={
          unreadCount > 0 ? (
            <button
              onClick={markAllNotificationsRead}
              className="text-[12px] font-semibold text-[#2563EB]"
            >
              Mark all read
            </button>
          ) : null
        }
      />

      <div className="page-content scrollbar-hide" style={{ paddingBottom: '24px' }}>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#B0B0B0]">
            <BellOff size={40} strokeWidth={1.5} />
            <div className="text-[14px] font-semibold">No notifications yet</div>
          </div>
        ) : (
          <>
            {Object.entries(groups).map(([label, items]) => (
              <div key={label}>
                {/* Group label */}
                <div className="px-4 pt-4 pb-1.5 text-[11px] font-bold text-[#707070] uppercase tracking-wider">
                  {label}
                </div>

                {/* Items */}
                <div className="bg-white border-t border-b border-[#E3E5EA]">
                  {items.map((notif, i) => {
                    const cfg = getConfig(notif.type)
                    const Icon = cfg.icon
                    return (
                      <div key={notif.id}>
                        <button
                          onClick={() => handleTap(notif)}
                          className={`w-full flex items-start gap-3 px-4 py-3.5 text-left active:opacity-80 transition-opacity ${!notif.read ? 'bg-[#FFFAF9]' : 'bg-white'}`}
                        >
                          {/* Icon */}
                          <div className={`w-10 h-10 rounded-xl ${cfg.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            <Icon size={18} className={cfg.iconColor} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <span className={`text-[13px] font-bold text-[#1F1F1F] leading-snug ${!notif.read ? 'text-[#1F1F1F]' : 'text-[#444]'}`}>
                                {notif.title}
                              </span>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <span className="text-[10px] text-[#B0B0B0] whitespace-nowrap">{timeAgo(notif.createdAt)}</span>
                                {!notif.read && (
                                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                                )}
                              </div>
                            </div>
                            <p className="text-[12px] text-[#707070] mt-0.5 leading-snug line-clamp-2">
                              {notif.body}
                            </p>
                            {notif.ref?.startsWith('INV-') && (
                              <span className="text-[10px] font-mono text-[#B0B0B0] mt-0.5 block">{notif.ref}</span>
                            )}
                          </div>
                        </button>
                        {i < items.length - 1 && <div className="h-px bg-[#F0F0F0] ml-[68px]" />}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Clear all */}
            <div className="px-4 pt-4">
              <button
                onClick={clearNotifications}
                className="w-full py-2.5 rounded-xl border border-[#E3E5EA] text-[13px] font-semibold text-[#707070] bg-white active:opacity-70"
              >
                Clear All Notifications
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
