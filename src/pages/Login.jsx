import { useState } from 'react'
import { useStore } from '../store'
import { Eye, EyeOff, FileText } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-b from-[#1E3A8A] via-[#1A3278] to-[#162B66] flex flex-col items-center justify-center px-5 py-10">

      {/* Logo / Brand */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg mb-4">
          <FileText size={40} className="text-white" strokeWidth={1.6} />
        </div>
        <h1 className="text-[28px] font-bold text-white tracking-tight">RunDoc</h1>
        <p className="text-[13px] text-white/60 mt-1">Document & Expense Management</p>
      </div>

      <div className="w-full max-w-sm space-y-3">

        {/* Card container */}
        <div className="bg-white rounded-2xl shadow-xl p-5 space-y-4">

          <div className="text-center mb-1">
            <h2 className="text-[17px] font-bold text-[#1F1F1F]">Welcome Back</h2>
            <p className="text-[12px] text-[#707070] mt-0.5">Sign in to your account</p>
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
                className="w-full px-4 py-3 rounded-xl border-[1.5px] border-[#E3E5EA] text-[14px] text-[#1F1F1F] outline-none bg-[#F8F9FB] focus:bg-white focus:border-[#1E3A8A] transition-colors"
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
                  className="w-full px-4 py-3 pr-12 rounded-xl border-[1.5px] border-[#E3E5EA] text-[14px] text-[#1F1F1F] outline-none bg-[#F8F9FB] focus:bg-white focus:border-[#1E3A8A] transition-colors"
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
              className="w-full py-3.5 rounded-xl bg-[#1E3A8A] text-white text-[15px] font-semibold shadow-sm active:opacity-80 hover:bg-[#1A3278] transition-colors"
            >
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#E3E5EA]" />
            <span className="text-[11px] text-[#B0B0B0] font-medium">or</span>
            <div className="flex-1 h-px bg-[#E3E5EA]" />
          </div>

          {/* Telegram login */}
          <button
            onClick={handleTelegram}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-[#2AABEE] text-white text-[15px] font-semibold active:opacity-80 disabled:opacity-60 transition-opacity"
          >
            <TelegramIcon size={20} />
            {loading ? 'Connecting…' : 'Continue with Telegram'}
          </button>

        </div>

      </div>

      {/* Footer */}
      <p className="text-[11px] text-white/30 mt-8">RunDoc v1.0 — Document & Expense</p>
    </div>
  )
}
