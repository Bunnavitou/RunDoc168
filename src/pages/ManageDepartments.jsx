import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'

export default function ManageDepartments() {
  const navigate = useNavigate()
  const { departments, addDepartment, updateDepartment, deleteDepartment } = useStore()

  const [newName,   setNewName]   = useState('')
  const [editName,  setEditName]  = useState('')   // current edit value
  const [editIndex, setEditIndex] = useState(null) // which row is being edited
  const [deleteTarget, setDeleteTarget] = useState(null)

  function handleAdd() {
    const trimmed = newName.trim()
    if (!trimmed || departments.includes(trimmed)) return
    addDepartment(trimmed)
    setNewName('')
  }

  function startEdit(i) {
    setEditIndex(i)
    setEditName(departments[i])
  }

  function commitEdit() {
    const trimmed = editName.trim()
    if (trimmed && trimmed !== departments[editIndex] && !departments.includes(trimmed)) {
      updateDepartment(departments[editIndex], trimmed)
    }
    setEditIndex(null)
  }

  function cancelEdit() {
    setEditIndex(null)
  }

  function confirmDelete(name) {
    deleteDepartment(name)
    setDeleteTarget(null)
  }

  return (
    <div className="app-shell">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3 border-b border-[#E3E5EA] flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-[#F6F6F6] flex items-center justify-center text-[#1F1F1F]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <h1 className="text-[18px] font-bold text-[#1F1F1F]">Manage Departments</h1>
      </div>

      <div className="overflow-y-auto scrollbar-hide p-4 space-y-4" style={{ height: 'calc(100% - 60px)', paddingBottom: '24px' }}>

        {/* Add new */}
        <div>
          <label className="block text-[12px] font-bold text-[#707070] mb-1">New Department</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Legal"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              className="flex-1 bg-white border border-[#E3E5EA] focus:border-[#1E3A8A] rounded-xl px-3 py-2.5 text-[14px] outline-none"
            />
            <button
              onClick={handleAdd}
              disabled={!newName.trim() || departments.includes(newName.trim())}
              className="w-11 h-11 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center flex-shrink-0 disabled:opacity-40"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Department list */}
        <div className="bg-white rounded-xl border border-[#E3E5EA] divide-y divide-[#F0F0F0] overflow-hidden">
          {departments.length === 0 && (
            <div className="text-center py-8 text-[13px] text-[#B0B0B0]">No departments yet</div>
          )}
          {departments.map((dept, i) => (
            <div key={dept} className="flex items-center gap-3 px-4 py-3">
              {editIndex === i ? (
                <>
                  <input
                    autoFocus
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') cancelEdit() }}
                    className="flex-1 bg-white border border-[#1E3A8A] rounded-lg px-2.5 py-1.5 text-[14px] outline-none"
                  />
                  <button onClick={commitEdit} className="w-8 h-8 rounded-lg bg-[#E8F6EF] flex items-center justify-center">
                    <Check size={15} className="text-[#1F6F4E]" />
                  </button>
                  <button onClick={cancelEdit} className="w-8 h-8 rounded-lg bg-[#F6F6F6] flex items-center justify-center">
                    <X size={15} className="text-[#707070]" />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-[14px] font-medium text-[#1F1F1F]">{dept}</span>
                  <button onClick={() => startEdit(i)} className="w-8 h-8 rounded-lg bg-[#EAF0FF] flex items-center justify-center">
                    <Pencil size={14} className="text-[#1E3A8A]" />
                  </button>
                  <button onClick={() => setDeleteTarget(dept)} className="w-8 h-8 rounded-lg bg-[#FFEDEA] flex items-center justify-center">
                    <Trash2 size={14} className="text-[#B12A1B]" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

      </div>

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-6">
          <div className="bg-white rounded-xl p-5 w-full max-w-sm">
            <div className="text-[15px] font-bold text-[#1F1F1F] mb-1">Delete Department</div>
            <div className="text-[13px] text-[#707070] mb-5">
              Remove <span className="font-semibold text-[#1F1F1F]">"{deleteTarget}"</span>? This cannot be undone.
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#E3E5EA] text-[14px] font-bold text-[#707070]"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(deleteTarget)}
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
