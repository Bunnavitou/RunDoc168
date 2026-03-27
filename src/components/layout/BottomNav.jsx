import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FileText, CheckSquare, MoreHorizontal } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/',         label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/request',  label: 'Request',   Icon: FileText        },
  { to: '/approval', label: 'Approval',  Icon: CheckSquare     },
  { to: '/more',     label: 'More',      Icon: MoreHorizontal  },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <div className="flex justify-around items-center h-14">
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-1.5 cursor-pointer ${isActive ? 'text-[#1E3A8A]' : 'text-[#707070]'}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-semibold">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
