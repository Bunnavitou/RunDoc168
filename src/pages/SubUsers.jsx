import { useState } from 'react'
import { useStore } from '../store'
import PageHeader from '../components/layout/PageHeader'
import Card, { Divider } from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import { ConfirmModal } from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { Plus, Edit2, Trash2, ShieldCheck, User, Eye, EyeOff } from 'lucide-react'

const ROLES = [
  { value: 'manager', label: 'Manager',  sub: 'Full access except settings',  color: 'bg-[#E8F0FF] text-[#1E40AF]' },
  { value: 'staff',   label: 'Staff',    sub: 'View & record meter readings',  color: 'bg-[#E8F6EF] text-[#1F6F4E]' },
  { value: 'viewer',  label: 'Viewer',   sub: 'Read-only access',              color: 'bg-[#F6F6F6] text-[#707070]' },
]

function roleMeta(value) {
  return ROLES.find(r => r.value === value) || ROLES[2]
}

function RoleBadge({ role }) {
  const meta = roleMeta(role)
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.color}`}>
      {meta.label}
    </span>
  )
}

function StatusDot({ status }) {
  return (
    <span className={`inline-block w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-[#22C55E]' : 'bg-[#D1D5DB]'}`} />
  )
}

const EMPTY_FORM = { name: '', role: 'staff', phone: '', password: '', status: 'active' }

export default function SubUsers() {
  const { subUsers, addSubUser, updateSubUser, deleteSubUser } = useStore()

  const [addOpen,    setAddOpen]    = useState(false)
  const [editTarget, setEditTarget] = useState(null)   // user object
  const [deleteId,   setDeleteId]   = useState(null)

  const [form,   setForm]   = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [showPin, setShowPin] = useState(false)

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function openAdd() {
    setForm(EMPTY_FORM)
    setErrors({})
    setShowPin(false)
    setAddOpen(true)
  }

  function openEdit(user) {
    setForm({ name: user.name, role: user.role, phone: user.phone, password: user.password, status: user.status })
    setErrors({})
    setShowPin(false)
    setEditTarget(user)
  }

  function validate() {
    const errs = {}
    if (!form.name.trim())                      errs.name  = 'Name is required'
    if (!form.phone.trim())                     errs.phone = 'Phone is required'
    if (!form.password || form.password.length < 4) errs.password = 'Password must be at least 4 characters'
    return errs
  }

  function handleSaveAdd() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    addSubUser({ name: form.name.trim(), role: form.role, phone: form.phone.trim(), password: form.password, status: form.status })
    setAddOpen(false)
  }

  function handleSaveEdit() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    updateSubUser(editTarget.id, { name: form.name.trim(), role: form.role, phone: form.phone.trim(), password: form.password, status: form.status })
    setEditTarget(null)
  }

  function handleDelete() {
    deleteSubUser(deleteId)
    setDeleteId(null)
  }

  const isModalOpen = addOpen || !!editTarget
  const modalTitle  = addOpen ? 'Add Sub User' : `Edit ${editTarget?.name}`

  function handleSave() { addOpen ? handleSaveAdd() : handleSaveEdit() }
  function closeModal()  { setAddOpen(false); setEditTarget(null) }

  return (
    <div className="app-shell">
      <PageHeader title="Sub Users" />

      <div className="page-content scrollbar-hide p-4 space-y-4" style={{ paddingBottom: '100px' }}>

        {/* Info note */}
        <div className="bg-[#E8F0FF] rounded-xl px-4 py-3 text-[12px] text-[#1E40AF]">
          Sub users can log in with their phone number and PIN. Permissions are based on their assigned role.
        </div>

        {/* List */}
        {subUsers.length === 0 ? (
          <div className="text-center py-10 text-[13px] text-[#707070]">No sub users yet</div>
        ) : (
          <Card padding={false}>
            {subUsers.map((user, i) => (
              <div key={user.id}>
                <div className="flex items-center justify-between px-4 py-3.5">
                  {/* Avatar + info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F6F6F6] flex items-center justify-center text-[#707070] font-bold text-[16px] flex-shrink-0">
                      {user.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[14px] font-bold text-[#1F1F1F]">{user.name}</span>
                        <StatusDot status={user.status} />
                      </div>
                      <div className="text-[12px] text-[#707070] mt-0.5">{user.phone}</div>
                      <div className="mt-1">
                        <RoleBadge role={user.role} />
                      </div>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(user)}
                      className="w-8 h-8 rounded-lg bg-[#F6F6F6] flex items-center justify-center text-[#707070]"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteId(user.id)}
                      className="w-8 h-8 rounded-lg bg-[#FFEDEA] flex items-center justify-center text-[#B12A1B]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {i < subUsers.length - 1 && <Divider />}
              </div>
            ))}
          </Card>
        )}
      </div>

      {/* Floating add button */}
      <button
        onClick={openAdd}
        className="fixed bottom-8 right-1/2 translate-x-[50px] w-14 h-14 rounded-full bg-[#2563EB] text-white shadow-lg flex items-center justify-center active:opacity-80 z-40"
        style={{ maxWidth: 'calc(215px)' }}
      >
        <Plus size={24} />
      </button>

      {/* Add / Edit modal */}
      <Modal open={isModalOpen} onClose={closeModal} title={modalTitle}>

        {/* Role picker */}
        <div className="mb-3">
          <label className="text-[13px] font-semibold text-[#707070] mb-1.5 block">Role</label>
          <div className="space-y-2">
            {ROLES.map(r => (
              <button
                key={r.value}
                onClick={() => set('role', r.value)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border-[1.5px] transition-colors ${
                  form.role === r.value
                    ? 'border-[#2563EB] bg-[#E8F0FF]'
                    : 'border-[#E3E5EA] bg-white'
                }`}
              >
                <div className="text-left">
                  <div className={`text-[13px] font-bold ${form.role === r.value ? 'text-[#2563EB]' : 'text-[#1F1F1F]'}`}>{r.label}</div>
                  <div className="text-[11px] text-[#707070]">{r.sub}</div>
                </div>
                {form.role === r.value && (
                  <ShieldCheck size={16} className="text-[#2563EB] flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Full Name"
          placeholder="e.g. Narak Sovan"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          error={errors.name}
        />
        <Input
          label="Phone Number"
          placeholder="e.g. 012-111-222"
          type="tel"
          value={form.phone}
          onChange={e => set('phone', e.target.value)}
          error={errors.phone}
        />

        {/* Password with show/hide */}
        <div className="mb-3">
          <label className="text-[13px] font-semibold text-[#707070] mb-1.5 block">Password</label>
          <div className="relative">
            <input
              type={showPin ? 'text' : 'password'}
              placeholder="Min. 4 characters"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              className={`w-full px-3 py-2.5 pr-10 rounded-xl border-[1.5px] text-[14px] outline-none bg-white focus:border-[#2563EB] ${errors.password ? 'border-[#B12A1B]' : 'border-[#E3E5EA]'}`}
            />
            <button
              type="button"
              onClick={() => setShowPin(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#707070]"
            >
              {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-[11px] text-[#B12A1B] mt-1">{errors.password}</p>}
        </div>

        {/* Status toggle (edit only) */}
        {!!editTarget && (
          <div className="flex items-center justify-between bg-[#F6F6F6] rounded-xl px-4 py-3 mb-3">
            <div>
              <div className="text-[13px] font-bold text-[#1F1F1F]">Account Status</div>
              <div className="text-[11px] text-[#707070]">{form.status === 'active' ? 'Active — can log in' : 'Inactive — login disabled'}</div>
            </div>
            <button
              onClick={() => set('status', form.status === 'active' ? 'inactive' : 'active')}
              className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${form.status === 'active' ? 'bg-[#2563EB]' : 'bg-[#D1D5DB]'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.status === 'active' ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        )}

        <Button onClick={handleSave}>
          {addOpen ? 'Create Sub User' : 'Save Changes'}
        </Button>
      </Modal>

      {/* Delete confirm */}
      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Remove Sub User"
        message="This sub user will be permanently deleted and lose access to the app."
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  )
}
