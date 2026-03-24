import { useState } from 'react'
import { useStore } from '../store'
import PageHeader from '../components/layout/PageHeader'
import Card, { Divider } from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { Droplets, Zap, ParkingSquare, Wifi, Brush, Shirt, Package, PawPrint, Box, Plus, Edit2, Trash2 } from 'lucide-react'

const ICON_MAP = { Droplets, Zap, ParkingSquare, Wifi, Brush, Shirt, Package, PawPrint, Box }
const ICON_OPTIONS = Object.keys(ICON_MAP)

function ServiceIcon({ name, size = 18 }) {
  const Icon = ICON_MAP[name] || Box
  return <Icon size={size} />
}

export default function ServiceFees() {
  const { masterServices, updateMasterService, addMasterService, deleteMasterService } = useStore()

  const [editModal, setEditModal] = useState({ open: false, service: null })
  const [newModal, setNewModal] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // Edit state
  const [editRate, setEditRate] = useState('')
  const [editName, setEditName] = useState('')
  const [editIcon, setEditIcon] = useState('Box')

  // New service state
  const [newName, setNewName] = useState('')
  const [newRate, setNewRate] = useState('')
  const [newIcon, setNewIcon] = useState('Box')
  const [newErrors, setNewErrors] = useState({})

  function openEdit(svc) {
    setEditRate(String(svc.defaultRate))
    setEditName(svc.name)
    setEditIcon(svc.icon)
    setEditModal({ open: true, service: svc })
  }

  function handleSaveEdit() {
    const { service } = editModal
    updateMasterService(service.id, {
      name: editName.trim() || service.name,
      defaultRate: parseFloat(editRate) || service.defaultRate,
      icon: editIcon,
    })
    setEditModal({ open: false, service: null })
  }

  function handleDelete(id) {
    const result = deleteMasterService(id)
    if (result?.error) setDeleteError(result.error)
    else setDeleteError('')
  }

  function handleAddNew() {
    const errs = {}
    if (!newName.trim()) errs.name = 'Name is required'
    if (!newRate || parseFloat(newRate) <= 0) errs.rate = 'Rate is required'
    if (Object.keys(errs).length) { setNewErrors(errs); return }
    addMasterService({
      name: newName.trim(),
      defaultRate: parseFloat(newRate),
      icon: newIcon,
      type: 'fixed',
      unitLabel: '$/mo',
      canDelete: true,
    })
    setNewName('')
    setNewRate('')
    setNewIcon('Box')
    setNewErrors({})
    setNewModal(false)
  }

  const utilities = masterServices.filter(s => s.type === 'utility')
  const custom    = masterServices.filter(s => s.type === 'fixed')

  return (
    <div className="app-shell">
      <PageHeader title="Service Fees" />

      <div className="page-content scrollbar-hide p-4 space-y-4" style={{ paddingBottom: '100px' }}>

        {deleteError && (
          <div className="bg-[#FFEDEA] rounded-xl p-3 text-[13px] text-[#B12A1B]">{deleteError}</div>
        )}

        {/* Utility services */}
        <div>
          <div className="text-[11px] font-semibold text-[#707070] uppercase tracking-wide mb-2">Utilities (Metered)</div>
          <Card padding={false}>
            {utilities.map((svc, i) => (
              <div key={svc.id}>
                <div className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EAF3FF] flex items-center justify-center text-[#1A5FA5]">
                      <ServiceIcon name={svc.icon} />
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-[#1F1F1F]">{svc.name}</div>
                      <div className="text-[11px] text-[#707070]">{svc.unitLabel}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-[14px] font-bold text-[#1F1F1F]">${svc.defaultRate}</div>
                    <button
                      onClick={() => openEdit(svc)}
                      className="w-8 h-8 rounded-lg bg-[#F6F6F6] flex items-center justify-center text-[#707070]"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                </div>
                {i < utilities.length - 1 && <Divider />}
              </div>
            ))}
          </Card>
        </div>

        {/* Custom services */}
        <div>
          <div className="text-[11px] font-semibold text-[#707070] uppercase tracking-wide mb-2">Custom Services</div>
          {custom.length === 0 ? (
            <div className="text-center py-6 text-[13px] text-[#707070]">No custom services yet</div>
          ) : (
            <Card padding={false}>
              {custom.map((svc, i) => (
                <div key={svc.id}>
                  <div className="flex items-center justify-between px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F6F6F6] flex items-center justify-center text-[#707070]">
                        <ServiceIcon name={svc.icon} />
                      </div>
                      <div>
                        <div className="text-[14px] font-bold text-[#1F1F1F]">{svc.name}</div>
                        <div className="text-[11px] text-[#707070]">{svc.unitLabel}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-[14px] font-bold text-[#1F1F1F]">${svc.defaultRate}</div>
                      <button
                        onClick={() => openEdit(svc)}
                        className="w-8 h-8 rounded-lg bg-[#F6F6F6] flex items-center justify-center text-[#707070]"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(svc.id)}
                        className="w-8 h-8 rounded-lg bg-[#FFEDEA] flex items-center justify-center text-[#B12A1B]"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {i < custom.length - 1 && <Divider />}
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>

      {/* Floating add button */}
      <button
        onClick={() => setNewModal(true)}
        className="fixed bottom-8 right-1/2 translate-x-[50px] w-14 h-14 rounded-full bg-[#D64045] text-white shadow-lg flex items-center justify-center active:opacity-80 z-40"
        style={{ maxWidth: 'calc(215px)' }}
      >
        <Plus size={24} />
      </button>

      {/* Edit service modal */}
      <Modal
        open={editModal.open}
        onClose={() => setEditModal({ open: false, service: null })}
        title={`Edit ${editModal.service?.name}`}
      >
        {editModal.service && !editModal.service.canDelete && (
          <div className="bg-[#EAF3FF] rounded-xl p-3 mb-3 text-[12px] text-[#1A5FA5]">
            Rate changes apply to new invoices only. Existing invoices are not affected.
          </div>
        )}

        {editModal.service?.canDelete && (
          <div className="mb-3">
            <label className="text-[13px] font-semibold text-[#707070] mb-1.5 block">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map(name => {
                const Icon = ICON_MAP[name]
                return (
                  <button
                    key={name}
                    onClick={() => setEditIcon(name)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-colors ${
                      editIcon === name ? 'border-[#D64045] bg-[#FFEDEA] text-[#D64045]' : 'border-[#E3E5EA] bg-white text-[#707070]'
                    }`}
                  >
                    <Icon size={18} />
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {editModal.service?.canDelete && (
          <Input label="Service Name" value={editName} onChange={e => setEditName(e.target.value)} />
        )}

        <Input
          label={`Rate (${editModal.service?.unitLabel || '$/mo'})`}
          type="number"
          step="0.01"
          value={editRate}
          onChange={e => setEditRate(e.target.value)}
        />
        <Button onClick={handleSaveEdit}>Save Changes</Button>
      </Modal>

      {/* New service modal */}
      <Modal open={newModal} onClose={() => setNewModal(false)} title="New Service Fee">
        <div className="mb-3">
          <label className="text-[13px] font-semibold text-[#707070] mb-1.5 block">Icon</label>
          <div className="flex flex-wrap gap-2">
            {ICON_OPTIONS.map(name => {
              const Icon = ICON_MAP[name]
              return (
                <button
                  key={name}
                  onClick={() => setNewIcon(name)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-colors ${
                    newIcon === name ? 'border-[#D64045] bg-[#FFEDEA] text-[#D64045]' : 'border-[#E3E5EA] bg-white text-[#707070]'
                  }`}
                >
                  <Icon size={18} />
                </button>
              )
            })}
          </div>
        </div>
        <Input label="Service Name" placeholder="e.g. Pet Fee" value={newName} onChange={e => setNewName(e.target.value)} error={newErrors.name} />
        <Input label="Monthly Rate ($)" type="number" placeholder="e.g. 25" value={newRate} onChange={e => setNewRate(e.target.value)} error={newErrors.rate} />
        <Button onClick={handleAddNew}>Create Service</Button>
      </Modal>
    </div>
  )
}
