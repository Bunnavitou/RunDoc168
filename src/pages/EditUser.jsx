import { useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader'
import { useStore } from '../store'
import { Camera, Trash2, Settings2 } from 'lucide-react'

export default function EditUser() {
  const navigate    = useNavigate()
  const { id }      = useParams()
  const { subUsers, updateSubUser, deleteSubUser, departments } = useStore()
  const fileRef     = useRef()

  const user = subUsers.find(u => u.id === id)

  const [form, setForm] = useState({
    profileImage: user?.profileImage ?? null,
    name:         user?.name         ?? '',
    phone:        user?.phone        ?? '',
    password:     user?.password     ?? '',
    department:   user?.department   ?? '',
  })
  const [errors,  setErrors]  = useState({})
  const [confirm, setConfirm] = useState(false)

  if (!user) {
    navigate('/sub-users', { replace: true })
    return null
  }

  function setField(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  function handleImage(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setField('profileImage', ev.target.result)
    reader.readAsDataURL(file)
  }

  function validate() {
    const e = {}
    if (!form.name.trim())     e.name     = 'Full name is required'
    if (!form.phone.trim())    e.phone    = 'Phone number is required'
    if (!form.password.trim()) e.password = 'Password is required'
    return e
  }

  function submit() {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    updateSubUser(id, {
      profileImage: form.profileImage,
      name:         form.name.trim(),
      phone:        form.phone.trim(),
      password:     form.password.trim(),
      department:   form.department,
    })
    navigate('/sub-users')
  }

  function handleDelete() {
    deleteSubUser(id)
    navigate('/sub-users')
  }

  return (
    <div className="app-shell">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3 border-b border-[#E3E5EA] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-[#F6F6F6] flex items-center justify-center text-[#1F1F1F]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <h1 className="text-[18px] font-bold text-[#1F1F1F]">Edit User</h1>
        </div>
        <button onClick={() => setConfirm(true)} className="text-[13px] font-semibold text-[#EF4444]">
          Delete
        </button>
      </div>

      <div className="overflow-y-auto scrollbar-hide p-4 space-y-4" style={{ paddingBottom: '100px', height: 'calc(100% - 60px)' }}>

        {/* Profile Image */}
        <div className="flex flex-col items-center pt-2 pb-1">
          <button
            onClick={() => fileRef.current?.click()}
            className="relative w-24 h-24 rounded-full bg-[#F0F2F5] flex items-center justify-center overflow-hidden border-2 border-dashed border-[#D1D5DB] active:opacity-80"
          >
            {form.profileImage
              ? <img src={form.profileImage} alt="profile" className="w-full h-full object-cover" />
              : <Camera size={28} className="text-[#B0B0B0]" />
            }
            <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#1E3A8A] flex items-center justify-center border-2 border-white">
              <Camera size={12} className="text-white" />
            </div>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
          <div className="text-[11px] text-[#B0B0B0] mt-2">Tap to change photo</div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-[12px] font-bold text-[#707070] mb-1">Full Name *</label>
          <input
            type="text"
            placeholder="e.g. Dara Sopheak"
            value={form.name}
            onChange={e => setField('name', e.target.value)}
            className={`w-full bg-white rounded-xl px-3 py-3 text-[14px] outline-none border ${errors.name ? 'border-[#EF4444]' : 'border-[#E3E5EA] focus:border-[#1E3A8A]'}`}
          />
          {errors.name && <div className="text-[11px] text-[#EF4444] mt-1">{errors.name}</div>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-[12px] font-bold text-[#707070] mb-1">Phone Number *</label>
          <input
            type="tel"
            placeholder="e.g. 012-345-678"
            value={form.phone}
            onChange={e => setField('phone', e.target.value)}
            className={`w-full bg-white rounded-xl px-3 py-3 text-[14px] outline-none border ${errors.phone ? 'border-[#EF4444]' : 'border-[#E3E5EA] focus:border-[#1E3A8A]'}`}
          />
          {errors.phone && <div className="text-[11px] text-[#EF4444] mt-1">{errors.phone}</div>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-[12px] font-bold text-[#707070] mb-1">Password *</label>
          <input
            type="password"
            placeholder="Enter new password"
            value={form.password}
            onChange={e => setField('password', e.target.value)}
            className={`w-full bg-white rounded-xl px-3 py-3 text-[14px] outline-none border ${errors.password ? 'border-[#EF4444]' : 'border-[#E3E5EA] focus:border-[#1E3A8A]'}`}
          />
          {errors.password && <div className="text-[11px] text-[#EF4444] mt-1">{errors.password}</div>}
        </div>

        {/* Department */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[12px] font-bold text-[#707070]">Department</label>
            <button
              onClick={() => navigate('/departments')}
              className="flex items-center gap-1 text-[12px] font-semibold text-[#1E3A8A]"
            >
              <Settings2 size={13} /> Manage
            </button>
          </div>
          <div className="relative">
            <select
              value={form.department}
              onChange={e => setField('department', e.target.value)}
              className="w-full appearance-none bg-white border border-[#E3E5EA] focus:border-[#1E3A8A] rounded-xl px-3 py-3 text-[14px] text-[#1F1F1F] outline-none"
            >
              <option value="">Select department</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Save button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E3E5EA] px-4 py-3 max-w-[430px] mx-auto">
        <button
          onClick={submit}
          className="w-full py-3.5 rounded-xl bg-[#1E3A8A] text-white text-[15px] font-bold"
        >
          Save Changes
        </button>
      </div>

      {/* Delete confirm */}
      {confirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-6">
          <div className="bg-white rounded-xl p-5 w-full max-w-sm">
            <div className="text-[15px] font-bold text-[#1F1F1F] mb-1">Delete User</div>
            <div className="text-[13px] text-[#707070] mb-5">This will permanently remove {user.name} from the system.</div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#E3E5EA] text-[14px] font-bold text-[#707070]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-[#EF4444] text-white text-[14px] font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
