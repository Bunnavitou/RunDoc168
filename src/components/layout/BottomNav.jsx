import { NavLink } from 'react-router-dom'
import { Home, Users, Receipt, MoreHorizontal } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/',        label: 'Room',    Icon: Home          },
  { to: '/tenants', label: 'Tenant',  Icon: Users         },
  { to: '/billing', label: 'Billing', Icon: Receipt       },
  { to: '/more',    label: 'More',    Icon: MoreHorizontal },
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
              `flex flex-col items-center gap-0.5 px-4 py-1.5 cursor-pointer ${isActive ? 'text-[#2563EB]' : 'text-[#707070]'}`
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
