import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import PageHeader from '../components/layout/PageHeader'
import Badge, { invoiceStatusVariant, invoiceStatusLabel } from '../components/ui/Badge'
import Card, { Divider } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Phone, Edit2, Check, X, ChevronRight } from 'lucide-react'

export default function TenantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { tenants, updateTenant, getTenantRooms, getInvoicesByRoom } = useStore()

  const tenant = tenants.find(t => t.id === id)
  const tenantRooms = getTenantRooms(id)

  const [editingName, setEditingName] = useState(false)
  const [editingPhone, setEditingPhone] = useState(false)
  const [nameVal, setNameVal] = useState('')
  const [phoneVal, setPhoneVal] = useState('')

  if (!tenant) {
    return (
      <div className="app-shell">
        <PageHeader title="Tenant Not Found" />
        <div className="p-4 text-center text-[#707070]">Tenant not found.</div>
      </div>
    )
  }

  function startEditName() { setNameVal(tenant.name); setEditingName(true) }
  function saveName() { if (nameVal.trim()) updateTenant(id, { name: nameVal.trim() }); setEditingName(false) }
  function startEditPhone() { setPhoneVal(tenant.phone); setEditingPhone(true) }
  function savePhone() { if (phoneVal.trim()) updateTenant(id, { phone: phoneVal.trim() }); setEditingPhone(false) }

  // Collect all invoices for rooms this tenant has contracts for
  const recentInvoices = tenantRooms
    .flatMap(({ room }) => getInvoicesByRoom(room.id).slice(0, 2))
    .sort((a, b) => new Date(b.periodStart) - new Date(a.periodStart))
    .slice(0, 4)

  return (
    <div className="app-shell">
      <PageHeader title="Tenant Detail" />

      <div className="page-content scrollbar-hide p-4 space-y-4" style={{ paddingBottom: '24px' }}>

        {/* Profile card */}
        <Card>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-[#FFEDEA] flex items-center justify-center text-[#D64045] font-bold text-[28px] flex-shrink-0">
              {tenant.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    className="input-base flex-1 text-[15px] font-bold py-1.5"
                    value={nameVal}
                    onChange={e => setNameVal(e.target.value)}
                    autoFocus
                  />
                  <button onClick={saveName} className="text-[#D64045]"><Check size={16} /></button>
                  <button onClick={() => setEditingName(false)} className="text-[#707070]"><X size={16} /></button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="text-[16px] font-bold text-[#1F1F1F] truncate">{tenant.name}</div>
                  <button onClick={startEditName} className="text-[#B0B0B0] flex-shrink-0">
                    <Edit2 size={14} />
                  </button>
                </div>
              )}

              {editingPhone ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    className="input-base flex-1 text-[13px] py-1"
                    value={phoneVal}
                    onChange={e => setPhoneVal(e.target.value)}
                    type="tel"
                    autoFocus
                  />
                  <button onClick={savePhone} className="text-[#D64045]"><Check size={14} /></button>
                  <button onClick={() => setEditingPhone(false)} className="text-[#707070]"><X size={14} /></button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Phone size={12} className="text-[#707070]" />
                  <span className="text-[13px] text-[#707070]">{tenant.phone}</span>
                  <button onClick={startEditPhone} className="text-[#B0B0B0]">
                    <Edit2 size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
          <Badge variant={tenant.status === 'active' ? 'green' : 'grey'}>
            {tenant.status === 'active' ? 'Active' : 'Inactive'}
          </Badge>
        </Card>

        {/* Rooms */}
        {tenantRooms.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold text-[#707070] uppercase tracking-wide mb-2">Rooms</div>
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
            <div className="text-[11px] font-semibold text-[#707070] uppercase tracking-wide mb-2">Recent Invoices</div>
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
