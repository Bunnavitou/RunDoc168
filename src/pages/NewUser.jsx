import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader'
import { useStore } from '../store'
import { Camera, Settings2 } from 'lucide-react'

export default function NewUser() {
  const navigate    = useNavigate()
  const addSubUser  = useStore(s => s.addSubUser)
  const departments = useStore(s => s.departments)
  const fileRef    = useRef()

  const [form, setForm] = useState({
    profileImage: null,
    name:         '',
    phone:        '',
    password:     '',
    department:   '',
  })
  const [errors, setErrors] = useState({})

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
    addSubUser({
      profileImage: form.profileImage,
      name:         form.name.trim(),
      phone:        form.phone.trim(),
      password:     form.password.trim(),
      department:   form.department,
      status:       'active',
    })
    navigate('/sub-users')
  }

  return (
    <div className="app-shell">
      <PageHeader title="New User" />

      <div className="page-content scrollbar-hide p-4 space-y-4" style={{ paddingBottom: '48px' }}>

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
          <div className="text-[11px] text-[#B0B0B0] mt-2">Tap to add profile photo</div>
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
            placeholder="Set a login password"
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

        {/* Save */}
        <button
          onClick={submit}
          className="w-full py-3.5 rounded-xl bg-[#1E3A8A] text-white text-[15px] font-bold mt-2"
        >
          Create User
        </button>

      </div>
    </div>
  )
}
