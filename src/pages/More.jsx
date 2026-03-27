import { useNavigate } from 'react-router-dom'
import { User, Users, ScrollText, LogOut, ChevronRight, Settings, ClipboardList } from 'lucide-react'
import { useStore } from '../store'
import { translations } from '../lib/i18n'

export default function More() {
  const navigate = useNavigate()
  const { authUser, logout, language, setLanguage } = useStore()
  const t = (key) => translations[language]?.[key] ?? translations.en[key] ?? key

  const ROLE_LABEL = { owner: 'Owner', manager: 'Manager', staff: 'Staff', viewer: 'Viewer' }

  const MENU = [
    {
      icon: ClipboardList,
      iconBg: 'bg-[#FFF0F6]',
      iconColor: 'text-[#DB2777]',
      label: t('typeOfRequest'),
      sub: t('typeOfRequestSub'),
      action: () => navigate('/approval-types'),
    },
    {
      icon: Users,
      iconBg: 'bg-[#E8F6EF]',
      iconColor: 'text-[#1F6F4E]',
      label: t('subUsers'),
      sub: t('subUsersSub'),
      action: () => navigate('/sub-users'),
    },
    {
      icon: Settings,
      iconBg: 'bg-[#FFF3E8]',
      iconColor: 'text-[#8A6408]',
      label: t('settings'),
      sub: t('settingsSub'),
      action: () => navigate('/settings'),
    },
    {
      icon: ScrollText,
      iconBg: 'bg-[#F6F6F6]',
      iconColor: 'text-[#707070]',
      label: t('termsAndConditions'),
      sub: t('termsAndConditionsSub'),
      action: () => navigate('/terms'),
    },
  ]

  return (
    <div>
      {/* Header with language toggle */}
      <div className="bg-white px-4 pt-4 pb-3 border-b border-[#E3E5EA] flex items-center justify-between">
        <h1 className="text-[22px] font-bold text-[#1F1F1F]">{t('more')}</h1>

        {/* Language toggle */}
        <div className="flex items-center bg-[#F0F2F5] rounded-xl p-0.5">
          {[
            { code: 'en', label: 'EN' },
            { code: 'km', label: 'ខ្មែរ' },
          ].map(({ code, label }) => (
            <button
              key={code}
              onClick={() => setLanguage(code)}
              className={`px-3 py-1.5 rounded-[10px] text-[12px] font-bold transition-all ${
                language === code
                  ? 'bg-white text-[#1E3A8A] shadow-sm'
                  : 'text-[#707070]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-2.5">

        {/* Profile card */}
        {authUser && (
          <button
            onClick={() => navigate('/profile')}
            className="w-full bg-gradient-to-r from-[#1E3A8A] to-[#1A3278] rounded-xl px-4 py-4 flex items-center gap-4 active:opacity-90 text-left shadow-sm"
          >
            {/* Avatar */}
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-[22px] flex-shrink-0 overflow-hidden border-2 border-white/30">
              {authUser.profileImage
                ? <img src={authUser.profileImage} alt="avatar" className="w-full h-full object-cover" />
                : authUser.name?.[0]?.toUpperCase() || '?'
              }
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="text-[16px] font-bold text-white truncate">{authUser.name}</div>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="text-[11px] text-white/70 font-medium">{ROLE_LABEL[authUser.role] || authUser.role}</span>
                {authUser.via === 'telegram' && (
                  <span className="text-[10px] font-bold text-[#2AABEE] bg-white/90 px-1.5 py-0.5 rounded">Telegram</span>
                )}
              </div>
            </div>
          </button>
        )}

        {/* Menu items */}
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
          <span className="text-[14px] font-bold text-[#B12A1B]">{t('logOut')}</span>
        </button>

      </div>
    </div>
  )
}
