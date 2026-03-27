import { useState } from 'react'
import { useStore } from '../store'
import { Eye, EyeOff, Building2 } from 'lucide-react'

// Telegram SVG icon
function TelegramIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.32 13.617l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.828.942z"/>
    </svg>
  )
}

export default function Login() {
  const { loginWithCredentials, loginWithTelegram } = useStore()

  const [phone,    setPhone]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  function handleCredentials(e) {
    e.preventDefault()
    setError('')
    if (!phone.trim())    { setError('Please enter your phone number.'); return }
    if (!password.trim()) { setError('Please enter your password.'); return }
    const result = loginWithCredentials(phone.trim(), password)
    if (!result.success) setError(result.error)
  }

  function handleTelegram() {
    setLoading(true)
    setTimeout(() => {
      loginWithTelegram()
      setLoading(false)
    }, 600)
  }

  return (
    <div className="min-h-screen bg-[#F6F6F6] flex flex-col items-center justify-center px-5 py-10">

      {/* Logo / Brand */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-20 h-20 rounded-3xl bg-[#1E3A8A] flex items-center justify-center shadow-lg mb-4">
          <Building2 size={38} className="text-white" strokeWidth={1.8} />
        </div>
        <h1 className="text-[26px] font-bold text-[#1F1F1F] tracking-tight">PBMS</h1>
        <p className="text-[13px] text-[#707070] mt-1">Property & Billing Management</p>
      </div>

      <div className="w-full max-w-sm space-y-3">

        {/* Telegram login */}
        <button
          onClick={handleTelegram}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-[#2AABEE] text-white text-[15px] font-semibold shadow-sm active:opacity-80 disabled:opacity-60 transition-opacity"
        >
          <TelegramIcon size={20} />
          {loading ? 'Connecting…' : 'Continue with Telegram'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-[#E3E5EA]" />
          <span className="text-[12px] text-[#B0B0B0] font-medium">or sign in with</span>
          <div className="flex-1 h-px bg-[#E3E5EA]" />
        </div>

        {/* Credentials form */}
        <form onSubmit={handleCredentials} className="space-y-3">
          {/* Phone */}
          <div>
            <label className="text-[12px] font-semibold text-[#707070] mb-1.5 block">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={e => { setPhone(e.target.value); setError('') }}
              placeholder="e.g. 099-000-0001"
              autoComplete="username"
              className="w-full px-4 py-3 rounded-xl border-[1.5px] border-[#E3E5EA] text-[14px] text-[#1F1F1F] outline-none bg-white focus:border-[#1E3A8A] transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-[12px] font-semibold text-[#707070] mb-1.5 block">Password</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="Enter password"
                autoComplete="current-password"
                className="w-full px-4 py-3 pr-12 rounded-xl border-[1.5px] border-[#E3E5EA] text-[14px] text-[#1F1F1F] outline-none bg-white focus:border-[#1E3A8A] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#B0B0B0]"
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-[#FFEDEA] rounded-xl px-4 py-2.5 text-[12px] font-semibold text-[#B12A1B]">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[#1E3A8A] text-white text-[15px] font-semibold shadow-sm active:opacity-80 hover:bg-[#1E4FD8] transition-colors"
          >
            Sign In
          </button>
        </form>

        {/* Demo hint */}
        <div className="bg-white border border-[#E3E5EA] rounded-xl px-4 py-3 mt-2">
          <div className="text-[11px] font-bold text-[#707070] mb-1.5">Demo Credentials</div>
          <div className="text-[11px] text-[#707070] space-y-0.5">
            <div>Owner — <span className="font-mono font-semibold text-[#1F1F1F]">099-000-0001</span> / <span className="font-mono font-semibold text-[#1F1F1F]">admin1234</span></div>
            <div>Manager — <span className="font-mono font-semibold text-[#1F1F1F]">012-111-222</span> / <span className="font-mono font-semibold text-[#1F1F1F]">1234</span></div>
            <div>Staff — <span className="font-mono font-semibold text-[#1F1F1F]">015-333-444</span> / <span className="font-mono font-semibold text-[#1F1F1F]">5678</span></div>
          </div>
        </div>

      </div>
    </div>
  )
}
