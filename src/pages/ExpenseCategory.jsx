import { useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import Modal from '../components/ui/Modal'
import { ConfirmModal } from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { MOCK_CATEGORIES } from '../lib/mockData'
import { Plus, Edit2, Trash2, Tag, User } from 'lucide-react'
import { useStore } from '../store'
import { translations } from '../lib/i18n'

const COLORS = ['#1E3A8A','#0891B2','#7C3AED','#DB2777','#D97706','#059669','#EA580C','#DC2626']

const EMPTY_FORM = { name: '', color: '#1E3A8A', personInCharge: '', remark: '' }

export default function ExpenseCategory() {
  const { language } = useStore()
  const t = (key) => translations[language]?.[key] ?? translations.en[key] ?? key

  const [categories, setCategories] = useState(MOCK_CATEGORIES)
  const [addOpen,    setAddOpen]    = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteId,   setDeleteId]   = useState(null)
  const [form,  setForm]  = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  const isModalOpen = addOpen || !!editTarget
  const modalTitle  = addOpen ? t('addCategory') : t('editCategory')

  function openAdd() {
    setForm(EMPTY_FORM)
    setErrors({})
    setAddOpen(true)
  }

  function openEdit(cat) {
    setForm({ name: cat.name, color: cat.color, personInCharge: cat.personInCharge || '', remark: cat.remark || '' })
    setErrors({})
    setEditTarget(cat)
  }

  function handleSave() {
    if (!form.name.trim()) { setErrors({ name: language === 'km' ? 'សូមបញ្ចូលចំណងជើង' : 'Title is required' }); return }
    if (addOpen) {
      setCategories(prev => [
        ...prev,
        { id: `cat-${Date.now()}`, name: form.name.trim(), color: form.color, icon: 'Tag', personInCharge: form.personInCharge.trim(), remark: form.remark.trim() },
      ])
      setAddOpen(false)
    } else {
      setCategories(prev => prev.map(c =>
        c.id === editTarget.id
          ? { ...c, name: form.name.trim(), color: form.color, personInCharge: form.personInCharge.trim(), remark: form.remark.trim() }
          : c
      ))
      setEditTarget(null)
    }
  }

  function handleDelete() {
    setCategories(prev => prev.filter(c => c.id !== deleteId))
    setDeleteId(null)
  }

  return (
    <div className="app-shell">
      <PageHeader title={t('expenseCategoryTitle')} />

      <div className="page-content scrollbar-hide p-4 space-y-2" style={{ paddingBottom: '96px' }}>

        <div className="bg-[#EAF0FF] rounded-xl px-4 py-3 text-[12px] text-[#1A3278]">
          {t('categoryNote')}
        </div>

        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-xl border border-[#E3E5EA] px-4 py-3.5 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: cat.color + '22' }}
            >
              <Tag size={18} style={{ color: cat.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-bold text-[#1F1F1F] truncate">{cat.name}</div>
              {cat.personInCharge ? (
                <div className="flex items-center gap-1 mt-0.5">
                  <User size={11} className="text-[#B0B0B0] flex-shrink-0" />
                  <span className="text-[11px] text-[#707070] truncate">{cat.personInCharge}</span>
                </div>
              ) : null}
              {cat.remark ? (
                <div className="text-[11px] text-[#B0B0B0] mt-0.5 truncate">{cat.remark}</div>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openEdit(cat)}
                className="w-8 h-8 rounded-lg bg-[#F6F6F6] flex items-center justify-center text-[#707070]"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => setDeleteId(cat.id)}
                className="w-8 h-8 rounded-lg bg-[#FFEDEA] flex items-center justify-center text-[#B12A1B]"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

      </div>

      {/* FAB */}
      <button
        onClick={openAdd}
        className="fixed bottom-8 right-5 w-14 h-14 rounded-full bg-[#1E3A8A] text-white shadow-lg flex items-center justify-center active:opacity-80 z-40"
      >
        <Plus size={24} />
      </button>

      {/* Add / Edit modal */}
      <Modal open={isModalOpen} onClose={() => { setAddOpen(false); setEditTarget(null) }} title={modalTitle}>
        <Input
          label={t('categoryTitle')}
          placeholder={t('categoryTitlePlaceholder')}
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          error={errors.name}
        />

        <Input
          label={t('personInCharge')}
          placeholder={t('personInChargePlaceholder')}
          value={form.personInCharge}
          onChange={e => setForm(f => ({ ...f, personInCharge: e.target.value }))}
        />

        <div className="mb-3">
          <label className="text-[13px] font-semibold text-[#707070] mb-1.5 block">Remark</label>
          <textarea
            placeholder="Optional note about this category"
            value={form.remark}
            onChange={e => setForm(f => ({ ...f, remark: e.target.value }))}
            rows={2}
            className="w-full bg-[#F6F6F6] rounded-xl px-3 py-2.5 text-[13px] text-[#1F1F1F] outline-none border border-transparent focus:border-[#1E3A8A] resize-none"
          />
        </div>

        {/* Color picker */}
        <div className="mb-3">
          <label className="text-[13px] font-semibold text-[#707070] mb-2 block">{t('color')}</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setForm(f => ({ ...f, color: c }))}
                className={`w-9 h-9 rounded-xl border-2 transition-all ${form.color === c ? 'border-[#1F1F1F] scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <Button onClick={handleSave}>
          {addOpen ? t('createCategory') : t('saveChanges')}
        </Button>
      </Modal>

      {/* Delete confirm */}
      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={t('deleteCategory')}
        message={t('deleteMessage')}
        confirmLabel={t('delete')}
        confirmVariant="danger"
      />
    </div>
  )
}
