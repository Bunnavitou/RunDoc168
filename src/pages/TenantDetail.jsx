import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import PageHeader from '../components/layout/PageHeader'
import Badge, { invoiceStatusVariant, invoiceStatusLabel } from '../components/ui/Badge'
import Card, { Divider } from '../components/ui/Card'
import { Phone, Edit2, Check, X, ChevronRight, Camera } from 'lucide-react'

export default function TenantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { tenants, updateTenant, getTenantRooms, getInvoicesByRoom } = useStore()

  const tenant = tenants.find(t => t.id === id)
  const tenantRooms = getTenantRooms(id)

  const [editingName,  setEditingName]  = useState(false)
  const [editingPhone, setEditingPhone] = useState(false)
  const [nameVal,      setNameVal]      = useState('')
  const [phoneVal,     setPhoneVal]     = useState('')
  const fileRef = useRef(null)

  if (!tenant) {
    return (
      <div className="app-shell">
        <PageHeader title="Tenant Not Found" />
        <div className="p-4 text-center text-[#707070]">Tenant not found.</div>
      </div>
    )
  }

  function startEditName()  { setNameVal(tenant.name);   setEditingName(true) }
  function saveName()       { if (nameVal.trim()) updateTenant(id, { name: nameVal.trim() }); setEditingName(false) }
  function startEditPhone() { setPhoneVal(tenant.phone); setEditingPhone(true) }
  function savePhone()      { if (phoneVal.trim()) updateTenant(id, { phone: phoneVal.trim() }); setEditingPhone(false) }

  function handlePhotoFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => updateTenant(id, { photo: ev.target.result })
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const recentInvoices = tenantRooms
    .flatMap(({ room }) => getInvoicesByRoom(room.id).slice(0, 2))
    .sort((a, b) => new Date(b.periodStart) - new Date(a.periodStart))
    .slice(0, 4)

  return (
    <div className="app-shell">
      <PageHeader title="Tenant Profile" />

      <div className="page-content scrollbar-hide p-4 space-y-4" style={{ paddingBottom: '24px' }}>

        {/* ── Profile card ── */}
        <Card>
          {/* Avatar */}
          <div className="flex flex-col items-center pb-4 border-b border-[#F0F0F0] mb-4">
            <div className="relative mb-3">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#E3E5EA] bg-[#E8F0FF] flex items-center justify-center">
                {tenant.photo ? (
                  <img src={tenant.photo} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[32px] font-bold text-[#2563EB]">
                    {tenant.name[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow border-2 border-white"
              >
                <Camera size={13} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoFile} />
            </div>

            <Badge variant={tenant.status === 'active' ? 'green' : 'grey'}>
              {tenant.status === 'active' ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {/* Name */}
          <div className="mb-3">
            <div className="text-[11px] font-semibold text-[#707070] uppercase tracking-[0.4px] mb-1.5">Full Name</div>
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  className="input-base flex-1 text-[14px] py-2"
                  value={nameVal}
                  onChange={e => setNameVal(e.target.value)}
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && saveName()}
                />
                <button onClick={saveName} className="text-[#2563EB] p-1"><Check size={16} /></button>
                <button onClick={() => setEditingName(false)} className="text-[#707070] p-1"><X size={16} /></button>
              </div>
            ) : (
              <button
                onClick={startEditName}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border-[1.5px] border-[#E3E5EA] bg-white text-left"
              >
                <span className="text-[14px] font-semibold text-[#1F1F1F]">{tenant.name}</span>
                <Edit2 size={14} className="text-[#B0B0B0] flex-shrink-0" />
              </button>
            )}
          </div>

          {/* Phone */}
          <div>
            <div className="text-[11px] font-semibold text-[#707070] uppercase tracking-[0.4px] mb-1.5">Phone Number</div>
            {editingPhone ? (
              <div className="flex items-center gap-2">
                <input
                  className="input-base flex-1 text-[14px] py-2"
                  value={phoneVal}
                  onChange={e => setPhoneVal(e.target.value)}
                  type="tel"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && savePhone()}
                />
                <button onClick={savePhone} className="text-[#2563EB] p-1"><Check size={16} /></button>
                <button onClick={() => setEditingPhone(false)} className="text-[#707070] p-1"><X size={16} /></button>
              </div>
            ) : (
              <button
                onClick={startEditPhone}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border-[1.5px] border-[#E3E5EA] bg-white text-left"
              >
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-[#707070]" />
                  <span className="text-[14px] font-semibold text-[#1F1F1F]">{tenant.phone}</span>
                </div>
                <Edit2 size={14} className="text-[#B0B0B0] flex-shrink-0" />
              </button>
            )}
          </div>
        </Card>

        {/* Rooms */}
        {tenantRooms.length > 0 && (
          <div>
            <div className="text-[11px] font-bold text-[#707070] uppercase tracking-wider mb-2">Rooms</div>
            <Card padding={false}>
              {tenantRooms.map(({ room, building, floor, contract }, i) => (
                <div key={room.id}>
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer active:opacity-80"
                    onClick={() => navigate(`/room/${room.id}`)}
                  >
                    <div>
                      <div className="text-[14px] font-bold text-[#1F1F1F]">{room.name}</div>
                      <div className="text-[12px] text-[#707070]">
                        {building?.name} · {floor?.name}
                      </div>
                      {contract && (
                        <div className="text-[12px] text-[#707070]">
                          Rent: ${contract.baseRent}/mo · From {new Date(contract.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={contract?.status === 'active' ? 'green' : 'grey'}>
                        {contract?.status === 'active' ? 'Active' : contract?.status || 'N/A'}
                      </Badge>
                      <ChevronRight size={16} className="text-[#B0B0B0]" />
                    </div>
                  </div>
                  {i < tenantRooms.length - 1 && <Divider />}
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* Recent invoices */}
        {recentInvoices.length > 0 && (
          <div>
            <div className="text-[11px] font-bold text-[#707070] uppercase tracking-wider mb-2">Recent Invoices</div>
            <Card padding={false}>
              {recentInvoices.map((inv, i) => (
                <div key={inv.id}>
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer active:opacity-80"
                    onClick={() => navigate(`/invoice/${inv.id}`)}
                  >
                    <div>
                      <div className="text-[14px] font-bold text-[#1F1F1F]">
                        {new Date(inv.periodStart).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-[11px] text-[#707070]">{inv.id}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-[13px] font-bold">${inv.total?.toFixed(2)}</div>
                        <Badge variant={invoiceStatusVariant(inv.status)}>{invoiceStatusLabel(inv.status)}</Badge>
                      </div>
                      <ChevronRight size={14} className="text-[#B0B0B0]" />
                    </div>
                  </div>
                  {i < recentInvoices.length - 1 && <Divider />}
                </div>
              ))}
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
