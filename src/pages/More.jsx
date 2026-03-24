import { useNavigate } from 'react-router-dom'
import { Building2, Settings, FileText, Languages, Users, LogOut, ChevronRight, ChevronRight as Arrow } from 'lucide-react'
import { useStore } from '../store'

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'km', label: 'Khmer',   native: 'ភាសាខ្មែរ' },
]

const ROLE_LABEL = { owner: 'Owner', manager: 'Manager', staff: 'Staff', viewer: 'Viewer' }

export default function More() {
  const navigate = useNavigate()
  const { language, setLanguage, authUser, logout } = useStore()

  const MENU = [
    {
      icon: Building2,
      iconBg: 'bg-[#EAF3FF]',
      iconColor: 'text-[#1A5FA5]',
      label: 'Property Management',
      sub: 'Manage buildings, floors & rooms',
      action: () => navigate('/property'),
    },
    {
      icon: Settings,
      iconBg: 'bg-[#E8F6EF]',
      iconColor: 'text-[#1F6F4E]',
      label: 'Service Fees',
      sub: 'Manage master service catalog',
      action: () => navigate('/services'),
    },
    {
      icon: FileText,
      iconBg: 'bg-[#EAF3FF]',
      iconColor: 'text-[#1A5FA5]',
      label: 'Invoice Setup',
      sub: 'Configure header, body, footer & QR',
      action: () => navigate('/invoice-setup'),
    },
    {
      icon: Users,
      iconBg: 'bg-[#F3EEFF]',
      iconColor: 'text-[#6B3FA0]',
      label: 'Sub Users',
      sub: 'Manage staff and viewer accounts',
      action: () => navigate('/sub-users'),
    },
  ]

  return (
    <div>
      <div className="bg-white px-4 pt-4 pb-3 border-b border-[#E3E5EA]">
        <h1 className="text-[22px] font-bold text-[#1F1F1F]">More</h1>
      </div>

      <div className="p-4 space-y-2.5">

        {/* Current user card — tap to edit profile */}
        {authUser && (
          <button
            onClick={() => navigate('/profile')}
            className="w-full bg-white rounded-xl border border-[#E3E5EA] px-4 py-3.5 flex items-center gap-3 active:opacity-80 text-left"
          >
            <div className="w-11 h-11 rounded-full bg-[#FFEDEA] flex items-center justify-center text-[#D64045] font-bold text-[18px] flex-shrink-0 overflow-hidden flex-shrink-0">
              {authUser.profileImage
                ? <img src={authUser.profileImage} alt="avatar" className="w-full h-full object-cover" />
                : authUser.name?.[0]?.toUpperCase() || '?'
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-bold text-[#1F1F1F] truncate">{authUser.name}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] text-[#707070]">{ROLE_LABEL[authUser.role] || authUser.role}</span>
                {authUser.via === 'telegram' && (
                  <span className="text-[10px] font-bold text-[#2AABEE] bg-[#E8F6FF] px-1.5 py-0.5 rounded">Telegram</span>
                )}
              </div>
            </div>
            <ChevronRight size={16} className="text-[#B0B0B0] flex-shrink-0" />
          </button>
        )}

        {/* Language selector */}
        <div className="bg-white rounded-xl border border-[#E3E5EA] px-4 py-3.5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3EEFF] flex items-center justify-center flex-shrink-0">
              <Languages size={20} className="text-[#6B3FA0]" />
            </div>
            <div>
              <div className="text-[14px] font-bold text-[#1F1F1F]">Language</div>
              <div className="text-[12px] text-[#707070]">Display language for the app</div>
            </div>
          </div>
          <div className="flex gap-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`flex-1 py-2.5 rounded-xl border-[1.5px] text-center transition-colors ${
                  language === lang.code
                    ? 'border-[#D64045] bg-[#FFEDEA]'
                    : 'border-[#E3E5EA] bg-[#F6F6F6]'
                }`}
              >
                <div className={`text-[13px] font-bold ${language === lang.code ? 'text-[#D64045]' : 'text-[#1F1F1F]'}`}>
                  {lang.native}
                </div>
                <div className={`text-[11px] mt-0.5 ${language === lang.code ? 'text-[#D64045]' : 'text-[#707070]'}`}>
                  {lang.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Nav menu items */}
        {MENU.map(item => (
          <button
            key={item.label}
            onClick={item.action}
            className="w-full flex items-center justify-between bg-white rounded-xl border border-[#E3E5EA] px-4 py-3.5 active:opacity-80 text-left"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center flex-shrink-0`}>
                <item.icon size={20} className={item.iconColor} />
              </div>
              <div>
                <div className="text-[14px] font-bold text-[#1F1F1F]">{item.label}</div>
                <div className="text-[12px] text-[#707070]">{item.sub}</div>
              </div>
            </div>
            <ChevronRight size={18} className="text-[#B0B0B0]" />
          </button>
        ))}

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 bg-white rounded-xl border border-[#E3E5EA] px-4 py-3.5 active:opacity-80 text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FFEDEA] flex items-center justify-center flex-shrink-0">
            <LogOut size={20} className="text-[#B12A1B]" />
          </div>
          <span className="text-[14px] font-bold text-[#B12A1B]">Log Out</span>
        </button>

      </div>
    </div>
  )
}
