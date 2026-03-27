import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader'
import { useStore } from '../store'
import { Plus } from 'lucide-react'

function Avatar({ user, size = 44 }) {
  const initials = user.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'
  const colors   = ['bg-[#1E3A8A]', 'bg-[#6B3FA0]', 'bg-[#059669]', 'bg-[#D97706]', 'bg-[#DB2777]', 'bg-[#0891B2]']
  const bg       = colors[(user.name?.charCodeAt(0) ?? 0) % colors.length]

  if (user.profileImage) {
    return (
      <img
        src={user.profileImage}
        alt={user.name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover flex-shrink-0"
      />
    )
  }
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full ${bg} flex items-center justify-center text-white font-bold text-[15px] flex-shrink-0`}
    >
      {initials}
    </div>
  )
}

export default function SubUsers() {
  const navigate  = useNavigate()
  const subUsers  = useStore(s => s.subUsers)

  return (
    <div className="app-shell">
      <PageHeader title="Sub Users" />

      <div className="page-content scrollbar-hide p-4 space-y-2" style={{ paddingBottom: '96px' }}>

        {subUsers.length === 0 && (
          <div className="text-center py-16 text-[13px] text-[#B0B0B0]">No users yet. Tap + to add one.</div>
        )}

        {subUsers.map(user => (
          <button
            key={user.id}
            onClick={() => navigate(`/sub-users/${user.id}`)}
            className="w-full bg-white rounded-xl border border-[#E3E5EA] px-4 py-3.5 flex items-center gap-3 text-left active:opacity-80"
          >
            <Avatar user={user} size={44} />
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-bold text-[#1F1F1F] truncate">{user.name}</div>
              <div className="text-[12px] text-[#707070] mt-0.5">{user.department || '—'}</div>
            </div>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${user.status === 'active' ? 'bg-[#22C55E]' : 'bg-[#D1D5DB]'}`} />
          </button>
        ))}

      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/sub-users/new')}
        className="fixed bottom-6 right-5 w-14 h-14 rounded-full bg-[#1E3A8A] text-white shadow-lg flex items-center justify-center active:opacity-80 z-40"
      >
        <Plus size={24} />
      </button>
    </div>
  )
}
