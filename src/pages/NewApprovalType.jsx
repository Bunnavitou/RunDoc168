import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store'
import { Plus, Trash2, Search, X, ChevronDown } from 'lucide-react'

// ── Avatar helper ─────────────────────────────────────────────────────────────
const AVATAR_COLORS = ['#1E3A8A','#0891B2','#7C3AED','#059669','#D97706','#DB2777','#EA580C']
function avatarColor(name) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}
function Avatar({ user, size = 28 }) {
  if (user.profileImage) {
    return <img src={user.profileImage} alt={user.name} style={{ width: size, height: size }} className="rounded-full object-cover flex-shrink-0" />
  }
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.38, background: avatarColor(user.name) }}
    >
      {user.name[0]?.toUpperCase()}
    </div>
  )
}

// ── Searchable person picker (bottom-sheet modal) ─────────────────────────────
function PersonPicker({ value, users, onChange }) {
  const [query, setQuery] = useState('')
  const [open,  setOpen]  = useState(false)
  const inputRef          = useRef(null)

  const selected = users.find(u => u.name === value)

  const filtered = query.trim()
    ? users.filter(u =>
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        (u.department || '').toLowerCase().includes(query.toLowerCase())
      )
    : users

  function openSheet() { setOpen(true); setQuery('') }

  function select(user) {
    onChange(user.name)
    setOpen(false)
    setQuery('')
  }

  function clear(e) {
    e.stopPropagation()
    onChange('')
  }

  // Focus search input after sheet opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80)
  }, [open])

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={openSheet}
        className="w-full bg-[#F6F6F6] border border-[#E3E5EA] rounded-lg px-3 py-2.5 flex items-center gap-2.5 text-left outline-none active:opacity-80"
      >
        {selected ? (
          <>
            <Avatar user={selected} size={26} />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-[#1F1F1F] truncate">{selected.name}</div>
              {selected.department && <div className="text-[11px] text-[#707070]">{selected.department}</div>}
            </div>
            <button
              type="button"
              onClick={clear}
              className="w-6 h-6 rounded-full bg-[#E3E5EA] flex items-center justify-center flex-shrink-0"
            >
              <X size={11} className="text-[#707070]" />
            </button>
          </>
        ) : (
          <>
            <Search size={14} className="text-[#B0B0B0] flex-shrink-0" />
            <span className="flex-1 text-[13px] text-[#B0B0B0]">Search or select person…</span>
            <ChevronDown size={14} className="text-[#B0B0B0] flex-shrink-0" />
          </>
        )}
      </button>

      {/* Bottom-sheet overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => { setOpen(false); setQuery('') }}
          />

          {/* Sheet */}
          <div className="relative bg-white rounded-t-2xl flex flex-col max-w-[430px] w-full mx-auto"
               style={{ maxHeight: '72vh' }}>

            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[#E3E5EA]" />
            </div>

            {/* Sheet header */}
            <div className="flex items-center justify-between px-4 pb-3 pt-1">
              <div className="text-[15px] font-bold text-[#1F1F1F]">Select Person in Charge</div>
              <button
                onClick={() => { setOpen(false); setQuery('') }}
                className="w-8 h-8 rounded-xl bg-[#F6F6F6] flex items-center justify-center"
              >
                <X size={15} className="text-[#707070]" />
              </button>
            </div>

            {/* Search bar */}
            <div className="px-4 pb-3">
              <div className="flex items-center gap-2.5 bg-[#F6F6F6] border border-[#E3E5EA] rounded-xl px-3 py-2.5">
                <Search size={15} className="text-[#B0B0B0] flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search by name or department…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="flex-1 bg-transparent text-[14px] outline-none text-[#1F1F1F] placeholder:text-[#B0B0B0]"
                />
                {query && (
                  <button onClick={() => setQuery('')}>
                    <X size={13} className="text-[#B0B0B0]" />
                  </button>
                )}
              </div>
            </div>

            {/* User list */}
            <div className="overflow-y-auto flex-1 px-4 pb-6 space-y-2">
              {filtered.length === 0 ? (
                <div className="text-center py-10 text-[13px] text-[#B0B0B0]">No users found</div>
              ) : (
                filtered.map(u => {
                  const isSelected = u.name === value
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => select(u)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left active:opacity-80 transition-colors ${
                        isSelected
                          ? 'bg-[#EAF0FF] border-[#1E3A8A]'
                          : 'bg-white border-[#E3E5EA]'
                      }`}
                    >
                      <Avatar user={u} size={40} />
                      <div className="flex-1 min-w-0">
                        <div className={`text-[14px] font-semibold truncate ${isSelected ? 'text-[#1E3A8A]' : 'text-[#1F1F1F]'}`}>
                          {u.name}
                        </div>
                        {u.department && (
                          <div className="text-[12px] text-[#707070] mt-0.5">{u.department}</div>
                        )}
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-[#1E3A8A] flex items-center justify-center flex-shrink-0">
                          <svg width="10" height="10" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Step card ─────────────────────────────────────────────────────────────────
function StepRow({ step, index, subUsers, onChange, onDelete }) {
  return (
    <div className="flex gap-3 mb-4">
      {/* Card */}
      <div className="flex-1 bg-white rounded-xl border border-[#E3E5EA] shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#EAF0FF] border-b border-[#D1D9F0]">
          <span className="text-[12px] font-bold text-[#1E3A8A]">Step {index + 1}</span>
          <button
            onClick={onDelete}
            className="w-6 h-6 rounded-lg bg-[#FFEDEA] flex items-center justify-center"
          >
            <Trash2 size={12} className="text-[#B12A1B]" />
          </button>
        </div>

        {/* Card body */}
        <div className="px-4 py-3 space-y-3">
          {/* Role */}
          <div>
            <label className="block text-[11px] font-bold text-[#707070] mb-1">Role</label>
            <input
              type="text"
              placeholder="e.g. Line Manager"
              value={step.role}
              onChange={e => onChange({ ...step, role: e.target.value })}
              className="w-full bg-[#F6F6F6] rounded-lg px-3 py-2 text-[13px] outline-none border border-[#E3E5EA] focus:border-[#1E3A8A] focus:bg-white"
            />
          </div>

          {/* Person in charge */}
          <div>
            <label className="block text-[11px] font-bold text-[#707070] mb-1">Person in Charge</label>
            <PersonPicker
              value={step.personInCharge}
              users={subUsers}
              onChange={name => onChange({ ...step, personInCharge: name })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function NewApprovalType() {
  const navigate  = useNavigate()
  const { id }    = useParams()
  const isEdit    = !!id

  const { approvalTypes, subUsers, ownerProfile, addApprovalType, updateApprovalType, deleteApprovalType } = useStore()

  const allUsers = [
    { id: 'owner', name: ownerProfile.name, department: 'Management', profileImage: ownerProfile.profileImage || null },
    ...subUsers.filter(u => u.status !== 'inactive'),
  ]

  const existing = isEdit ? approvalTypes.find(t => t.id === id) : null

  const [form, setForm] = useState({
    name:        existing?.name        ?? '',
    description: existing?.description ?? '',
    steps:       existing?.steps.map(s => ({ ...s })) ?? [],
  })
  const [confirm, setConfirm] = useState(false)

  function addStep() {
    setForm(f => ({ ...f, steps: [...f.steps, { role: '', personInCharge: '' }] }))
  }
  function updateStep(i, val) {
    setForm(f => ({ ...f, steps: f.steps.map((s, idx) => idx === i ? val : s) }))
  }
  function removeStep(i) {
    setForm(f => ({ ...f, steps: f.steps.filter((_, idx) => idx !== i) }))
  }

  function save() {
    if (!form.name.trim()) return
    const payload = {
      name:        form.name.trim(),
      description: form.description.trim(),
      steps:       form.steps.filter(s => s.role.trim()),
    }
    if (isEdit) updateApprovalType(id, payload)
    else        addApprovalType(payload)
    navigate('/approval-types')
  }

  function confirmDelete() {
    deleteApprovalType(id)
    navigate('/approval-types')
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
          <h1 className="text-[18px] font-bold text-[#1F1F1F]">
            {isEdit ? 'Edit Approval Type' : 'New Approval Type'}
          </h1>
        </div>
        {isEdit && (
          <button onClick={() => setConfirm(true)} className="text-[13px] font-semibold text-[#EF4444]">
            Delete
          </button>
        )}
      </div>

      <div className="overflow-y-auto scrollbar-hide p-4 space-y-4" style={{ paddingBottom: '100px', height: 'calc(100% - 60px)' }}>

        {/* Title */}
        <div>
          <label className="block text-[12px] font-bold text-[#707070] mb-1">Title *</label>
          <input
            type="text"
            placeholder="e.g. Standard Purchase"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full bg-white rounded-xl px-3 py-3 text-[14px] outline-none border border-[#E3E5EA] focus:border-[#1E3A8A]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-[12px] font-bold text-[#707070] mb-1">Description</label>
          <textarea
            placeholder="Brief description of when this type is used"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={2}
            className="w-full bg-white rounded-xl px-3 py-3 text-[13px] outline-none border border-[#E3E5EA] focus:border-[#1E3A8A] resize-none"
          />
        </div>

        {/* Approval Steps */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-[12px] font-bold text-[#707070]">
              Approval Steps ({form.steps.length})
            </label>
            <button onClick={addStep} className="flex items-center gap-1 text-[13px] font-semibold text-[#1E3A8A]">
              <Plus size={14} /> Add Step
            </button>
          </div>

          {form.steps.length === 0 && (
            <div className="text-center py-8 text-[12px] text-[#B0B0B0] bg-[#F6F6F6] rounded-xl border border-dashed border-[#D1D5DB]">
              No steps yet. Tap "Add Step" to begin.
            </div>
          )}

          <div>
            {form.steps.map((step, i) => (
              <StepRow
                key={i}
                index={i}

                step={step}
                subUsers={allUsers}
                onChange={val => updateStep(i, val)}
                onDelete={() => removeStep(i)}
              />
            ))}
          </div>
        </div>

      </div>

      {/* Save button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E3E5EA] px-4 py-3 max-w-[430px] mx-auto">
        <button
          onClick={save}
          disabled={!form.name.trim()}
          className="w-full py-3.5 rounded-xl bg-[#1E3A8A] text-white text-[15px] font-bold disabled:opacity-40"
        >
          {isEdit ? 'Save Changes' : 'Create'}
        </button>
      </div>

      {/* Delete confirm */}
      {confirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-6">
          <div className="bg-white rounded-xl p-5 w-full max-w-sm">
            <div className="text-[15px] font-bold text-[#1F1F1F] mb-1">Delete Request Type</div>
            <div className="text-[13px] text-[#707070] mb-5">This action cannot be undone.</div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#E3E5EA] text-[14px] font-bold text-[#707070]"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
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
