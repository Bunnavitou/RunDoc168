import { useState, useRef } from 'react'
import { useStore } from '../store'
import PageHeader from '../components/layout/PageHeader'
import { Camera, Eye, EyeOff, Check } from 'lucide-react'

const ROLE_LABEL = { owner: 'Owner', manager: 'Manager', staff: 'Staff', viewer: 'Viewer' }
const ROLE_COLOR = {
  owner:   'bg-[#FFEDEA] text-[#D64045]',
  manager: 'bg-[#EAF3FF] text-[#1A5FA5]',
  staff:   'bg-[#E8F6EF] text-[#1F6F4E]',
  viewer:  'bg-[#F6F6F6] text-[#707070]',
}

function Field({ label, value, onChange, placeholder, type = 'text', readOnly = false }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-[#707070] uppercase tracking-[0.4px] mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange ? e => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full px-4 py-3 rounded-xl border-[1.5px] text-[14px] outline-none transition-colors ${
          readOnly
            ? 'border-[#E3E5EA] bg-[#F6F6F6] text-[#707070] cursor-default'
            : 'border-[#E3E5EA] bg-white text-[#1F1F1F] focus:border-[#D64045]'
        }`}
      />
    </div>
  )
}

function PasswordField({ label, value, onChange, placeholder, error }) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <label className="text-[11px] font-semibold text-[#707070] uppercase tracking-[0.4px] mb-1.5 block">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 pr-12 rounded-xl border-[1.5px] text-[14px] outline-none bg-white transition-colors focus:border-[#D64045] ${error ? 'border-[#B12A1B]' : 'border-[#E3E5EA]'}`}
        />
        <button type="button" onClick={() => setShow(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#B0B0B0]">
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      {error && <p className="text-[11px] text-[#B12A1B] mt-1">{error}</p>}
    </div>
  )
}

function SectionLabel({ children }) {
  return <div className="text-[11px] font-bold text-[#707070] uppercase tracking-wider pt-2 pb-1">{children}</div>
}

function SaveBanner({ show }) {
  if (!show) return null
  return (
    <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#1F6F4E] text-white text-[13px] font-semibold px-4 py-2.5 rounded-full shadow-lg">
      <Check size={14} /> Saved successfully
    </div>
  )
}

export default function Profile() {
  const { authUser, updateAuthProfile, changeAuthPassword } = useStore()

  // ── Profile form state ──
  const [name,   setName]   = useState(authUser?.name  || '')
  const [phone,  setPhone]  = useState(authUser?.phone || '')
  const [avatar, setAvatar] = useState(authUser?.profileImage || null)

  // ── Password form state ──
  const [currentPwd,  setCurrentPwd]  = useState('')
  const [newPwd,      setNewPwd]      = useState('')
  const [confirmPwd,  setConfirmPwd]  = useState('')
  const [pwdErrors,   setPwdErrors]   = useState({})

  const [profileSaved, setProfileSaved] = useState(false)
  const [pwdSaved,     setPwdSaved]     = useState(false)
  const [pwdError,     setPwdError]     = useState('')

  const fileRef = useRef(null)

  if (!authUser) return null

  // ── Avatar upload ──
  function handleAvatarFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setAvatar(ev.target.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // ── Save profile ──
  function handleSaveProfile() {
    if (!name.trim()) return
    updateAuthProfile({ name: name.trim(), phone: phone.trim(), profileImage: avatar })
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2000)
  }

  // ── Change password ──
  function handleChangePassword() {
    const errs = {}
    if (!currentPwd)              errs.current  = 'Enter current password'
    if (!newPwd || newPwd.length < 4) errs.new  = 'New password must be at least 4 characters'
    if (newPwd !== confirmPwd)    errs.confirm  = 'Passwords do not match'
    if (Object.keys(errs).length) { setPwdErrors(errs); return }

    const result = changeAuthPassword(currentPwd, newPwd)
    if (!result.success) {
      setPwdErrors({ current: result.error })
      return
    }
    setPwdErrors({})
    setPwdError('')
    setCurrentPwd('')
    setNewPwd('')
    setConfirmPwd('')
    setPwdSaved(true)
    setTimeout(() => setPwdSaved(false), 2000)
  }

  const isTelegram = authUser.via === 'telegram'

  return (
    <div className="app-shell">
      <PageHeader title="My Profile" />

      <SaveBanner show={profileSaved || pwdSaved} />

      <div className="page-content scrollbar-hide p-4 space-y-4" style={{ paddingBottom: '32px' }}>

        {/* ── Avatar ── */}
        <div className="flex flex-col items-center py-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#E3E5EA] bg-[#FFEDEA] flex items-center justify-center">
              {avatar ? (
                <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[36px] font-bold text-[#D64045]">
                  {authUser.name?.[0]?.toUpperCase() || '?'}
                </span>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#D64045] text-white flex items-center justify-center shadow border-2 border-white"
            >
              <Camera size={14} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
          </div>

          {/* Role badge — read only */}
          <div className={`mt-3 px-3 py-1 rounded-full text-[12px] font-bold ${ROLE_COLOR[authUser.role] || ROLE_COLOR.viewer}`}>
            {ROLE_LABEL[authUser.role] || authUser.role}
            {authUser.via === 'telegram' && <span className="ml-1.5 text-[10px] font-bold text-[#2AABEE]">· Telegram</span>}
          </div>
        </div>

        {/* ── Personal Info ── */}
        <div className="bg-white rounded-2xl border border-[#E3E5EA] px-4 py-4 space-y-3">
          <SectionLabel>Personal Info</SectionLabel>

          <Field
            label="Full Name"
            value={name}
            onChange={setName}
            placeholder="Your full name"
          />
          <Field
            label="Phone Number"
            value={phone}
            onChange={setPhone}
            placeholder="e.g. 099-000-0001"
            type="tel"
          />
          <Field
            label="User Type"
            value={ROLE_LABEL[authUser.role] || authUser.role}
            readOnly
          />

          <button
            onClick={handleSaveProfile}
            disabled={!name.trim()}
            className="w-full py-3 rounded-xl bg-[#D64045] text-white text-[14px] font-semibold active:opacity-80 disabled:opacity-40 transition-opacity mt-1"
          >
            Save Profile
          </button>
        </div>

        {/* ── Change Password ── (hidden for Telegram users) */}
        {!isTelegram && (
          <div className="bg-white rounded-2xl border border-[#E3E5EA] px-4 py-4 space-y-3">
            <SectionLabel>Change Password</SectionLabel>

            <PasswordField
              label="Current Password"
              value={currentPwd}
              onChange={v => { setCurrentPwd(v); setPwdErrors(p => ({ ...p, current: '' })) }}
              placeholder="Enter current password"
              error={pwdErrors.current}
            />
            <PasswordField
              label="New Password"
              value={newPwd}
              onChange={v => { setNewPwd(v); setPwdErrors(p => ({ ...p, new: '' })) }}
              placeholder="Min. 4 characters"
              error={pwdErrors.new}
            />
            <PasswordField
              label="Confirm New Password"
              value={confirmPwd}
              onChange={v => { setConfirmPwd(v); setPwdErrors(p => ({ ...p, confirm: '' })) }}
              placeholder="Re-enter new password"
              error={pwdErrors.confirm}
            />

            <button
              onClick={handleChangePassword}
              className="w-full py-3 rounded-xl bg-[#1F1F1F] text-white text-[14px] font-semibold active:opacity-80 transition-opacity mt-1"
            >
              Update Password
            </button>
          </div>
        )}

        {isTelegram && (
          <div className="bg-[#EAF3FF] rounded-xl px-4 py-3 text-[12px] text-[#1A5FA5]">
            Password change is not available for Telegram login accounts.
          </div>
        )}

      </div>
    </div>
  )
}
