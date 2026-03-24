import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import PageHeader from '../components/layout/PageHeader'
import Badge, { invoiceStatusVariant, invoiceStatusLabel } from '../components/ui/Badge'
import Card, { Divider, SectionLabel } from '../components/ui/Card'
import Button from '../components/ui/Button'
import DayRing from '../components/ui/DayRing'
import EmptyState from '../components/ui/EmptyState'
import StartBillModal from '../components/modals/StartBillModal'
import AddTenantModal from '../components/modals/AddTenantModal'
import AddMeterModal from '../components/modals/AddMeterModal'
import RemoveTenantModal from '../components/modals/RemoveTenantModal'
import AddServiceModal from '../components/modals/AddServiceModal'
import { getDayCounter, getDaysInMonth, shouldShowStartBill } from '../lib/dayCounter'
import { Droplets, Zap, Edit2, Check, X, Plus, ChevronRight, Home, Box, Wifi, ParkingSquare, Brush, Shirt, Package, PawPrint } from 'lucide-react'

const ICON_MAP = { Droplets, Zap, ParkingSquare, Wifi, Brush, Shirt, Package, PawPrint, Box, Home }

function ServiceIcon({ name, size = 15 }) {
  const Icon = ICON_MAP[name] || Box
  return <Icon size={size} />
}

const TABS = ['Tenant', 'Meter', 'Billing']

export default function RoomDetail() {
  const { id: roomId } = useParams()
  const navigate = useNavigate()
  const {
    getRoomWithStatus, getRoomServices, getMeterReadings, getLastMeterReading,
    getInvoicesByRoom, updateContract, removeTenantFromRoom, addMeterReading,
    setRoomServices,
  } = useStore()

  const [tab, setTab] = useState(0)
  const [startBillOpen, setStartBillOpen] = useState(false)
  const [addTenantOpen, setAddTenantOpen] = useState(false)
  const [addMeterOpen, setAddMeterOpen] = useState(false)
  const [removeTenantOpen, setRemoveTenantOpen] = useState(false)
  const [addServiceOpen, setAddServiceOpen] = useState(false)
  const [billFilter, setBillFilter] = useState('all')

  // Inline edit contract
  const [editField, setEditField] = useState(null)
  const [editVal, setEditVal] = useState('')

  const today = new Date()
  const dayCounter = getDayCounter(today)
  const daysInMonth = getDaysInMonth(today)

  const info = getRoomWithStatus(roomId)
  if (!info) return <div className="app-shell"><div className="p-4 text-[#707070]">Room not found</div></div>

  const { room, contract, tenant, floor, building, occupied } = info
  const roomSvcs = getRoomServices(roomId)
  const meterReadings = getMeterReadings(roomId)
  const lastReading = getLastMeterReading(roomId)
  const invoices = getInvoicesByRoom(roomId)

  const thisMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  const hasActiveThisMonth = invoices.some(inv =>
    inv.periodStart?.slice(0, 7) === thisMonth && (inv.status === 'progress' || inv.status === 'overdue')
  )
  const showStartBill = occupied && shouldShowStartBill(dayCounter) && !hasActiveThisMonth

  const filteredInvoices = billFilter === 'all' ? invoices : invoices.filter(i => i.status === billFilter)

  function startEdit(field, val) { setEditField(field); setEditVal(String(val || '')) }
  function saveEdit() {
    if (!contract) return
    let update = {}
    if (editField === 'baseRent') update.baseRent = parseFloat(editVal) || 0
    if (editField === 'securityDeposit') update.securityDeposit = parseFloat(editVal) || 0
    if (editField === 'startDate') update.startDate = editVal
    if (editField === 'endDate') update.endDate = editVal || null
    updateContract(contract.id, update)
    setEditField(null)
  }

  function fmtDate(d) {
    if (!d) return '— (Open)'
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const BILL_TABS = [
    { key: 'all',      label: 'All',      count: invoices.length },
    { key: 'progress', label: 'Progress', count: invoices.filter(i => i.status === 'progress').length, color: 'text-[#8A6408]' },
    { key: 'paid',     label: 'Paid',     count: invoices.filter(i => i.status === 'paid').length,     color: 'text-[#1F6F4E]' },
    { key: 'overdue',  label: 'Overdue',  count: invoices.filter(i => i.status === 'overdue').length,  color: 'text-[#B12A1B]' },
  ]

  return (
    <div className="app-shell">
      <PageHeader
        title={room.name}
        subtitle={`${building?.name || ''} · ${floor?.name || ''}`}
        rightSlot={
          <Badge variant={occupied ? 'green' : 'grey'}>
            {occupied ? 'Occupied' : 'Vacant'}
          </Badge>
        }
      />

      {/* Tabs */}
      <div className="flex bg-white border-b border-[#E3E5EA] overflow-x-auto scrollbar-hide px-4">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`px-4 py-3 text-[13px] font-bold border-b-2 -mb-px whitespace-nowrap flex-shrink-0 transition-colors ${
              tab === i ? 'text-[#2563EB] border-[#2563EB]' : 'text-[#707070] border-transparent'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="page-content scrollbar-hide p-4 space-y-3" style={{ paddingBottom: '24px' }}>

        {/* ─── TAB 0: TENANT ─────────────────────────────────── */}
        {tab === 0 && (
          <>
            <SectionLabel>Tenant</SectionLabel>

            {occupied && tenant ? (
              <>
                <Card
                  onClick={() => navigate(`/tenant/${tenant.id}`)}
                  className="flex items-center gap-3"
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-[#E8F0FF] flex items-center justify-center text-[#2563EB] font-bold text-[24px] flex-shrink-0 border border-[#E3E5EA]">
                    {tenant.photo
                      ? <img src={tenant.photo} alt="avatar" className="w-full h-full object-cover" />
                      : tenant.name[0]
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-bold text-[#1F1F1F] truncate">{tenant.name}</div>
                    <div className="text-[13px] text-[#707070] flex items-center gap-1 mt-0.5">
                      <Droplets size={12} /> {tenant.phone}
                    </div>
                    <div className="text-[11px] text-[#2563EB] font-semibold mt-0.5">Tap to edit profile</div>
                  </div>
                  <ChevronRight size={18} className="text-[#B0B0B0]" />
                </Card>

                <Button variant="danger" onClick={() => setRemoveTenantOpen(true)}>
                  Remove Tenant
                </Button>

                {/* Services */}
                <SectionLabel>Services</SectionLabel>
                <Card padding={false}>
                  {roomSvcs.length === 0 ? (
                    <div className="py-4 text-center text-[13px] text-[#707070]">No services added yet</div>
                  ) : (
                    roomSvcs.map((svc, i) => (
                      <div key={svc.serviceId}>
                        <div className="flex items-center justify-between px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${svc.type === 'utility' ? 'bg-[#E8F0FF] text-[#1E40AF]' : 'bg-[#F6F6F6] text-[#707070]'}`}>
                              <ServiceIcon name={svc.icon} />
                            </div>
                            <div>
                              <div className="text-[14px] font-bold text-[#1F1F1F]">{svc.name}</div>
                              <div className="text-[11px] text-[#707070]">{svc.type === 'utility' ? 'Utility' : 'Fixed'}</div>
                            </div>
                          </div>
                          <div className="text-[13px] font-bold text-[#1F1F1F]">
                            ${svc.effectiveRate}{svc.unitLabel?.replace('$', '')}
                            {svc.priceOverride != null && (
                              <span className="text-[10px] font-bold text-[#8A6408] bg-[#FFF3DF] ml-1 px-1 py-0.5 rounded">Override</span>
                            )}
                          </div>
                        </div>
                        {i < roomSvcs.length - 1 && <Divider />}
                      </div>
                    ))
                  )}
                </Card>
                <Button variant="outline" onClick={() => setAddServiceOpen(true)}>
                  <Plus size={14} /> Add / Edit Services
                </Button>

                {/* Contract */}
                <SectionLabel>Contract</SectionLabel>
                <Card padding={false}>
                  {[
                    { label: 'Start Date',        field: 'startDate',        type: 'date',   val: contract.startDate,        display: fmtDate(contract.startDate) },
                    { label: 'End Date',           field: 'endDate',          type: 'date',   val: contract.endDate,          display: fmtDate(contract.endDate) },
                    { label: 'Base Rent',          field: 'baseRent',         type: 'number', val: contract.baseRent,         display: `$${contract.baseRent.toFixed(2)}/mo` },
                    { label: 'Security Deposit',   field: 'securityDeposit',  type: 'number', val: contract.securityDeposit,  display: `$${contract.securityDeposit.toFixed(2)}` },
                  ].map((row, i, arr) => (
                    <div key={row.field}>
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-[13px] text-[#707070]">{row.label}</span>
                        {editField === row.field ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type={row.type}
                              className="input-base py-1 text-[13px] w-36 text-right"
                              value={editVal}
                              onChange={e => setEditVal(e.target.value)}
                              autoFocus
                            />
                            <button onClick={saveEdit} className="text-[#2563EB]"><Check size={14} /></button>
                            <button onClick={() => setEditField(null)} className="text-[#707070]"><X size={14} /></button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(row.field, row.val)}
                            className="flex items-center gap-1.5 text-[13px] font-bold text-[#1F1F1F]"
                          >
                            {row.display}
                            <Edit2 size={12} className="text-[#B0B0B0]" />
                          </button>
                        )}
                      </div>
                      {i < arr.length - 1 && <Divider />}
                    </div>
                  ))}
                </Card>
              </>
            ) : (
              <>
                <Card>
                  <EmptyState
                    icon={<Home size={38} />}
                    title="No Tenant Assigned"
                    subtitle="This room is vacant. Add a tenant to get started."
                  />
                </Card>
                <Button onClick={() => setAddTenantOpen(true)}>
                  <Plus size={14} /> Add Tenant
                </Button>
              </>
            )}
          </>
        )}

        {/* ─── TAB 1: METER ──────────────────────────────────── */}
        {tab === 1 && (
          <>
            {meterReadings.length > 0 && (
              <>
                <SectionLabel>3-Month Usage Trend</SectionLabel>
                <Card className="flex gap-4">
                  {['Water (m³)', 'Electricity (kWh)'].map((label, li) => {
                    const recent = meterReadings.slice(0, 3).reverse()
                    const key = li === 0 ? 'waterCurrent' : 'elecCurrent'
                    const maxVal = Math.max(...recent.map(r => r[key]), 1)
                    return (
                      <div key={label} className="flex-1">
                        <div className="flex items-end gap-1 h-11 bg-[#E8F0FF] rounded-lg p-1.5">
                          {recent.map((r, i) => (
                            <div
                              key={i}
                              className="flex-1 bg-[#2563EB] rounded-sm opacity-70"
                              style={{ height: `${Math.max(10, (r[key] / maxVal) * 100)}%` }}
                            />
                          ))}
                        </div>
                        <div className="text-[10px] text-[#707070] text-center mt-1">{label}</div>
                      </div>
                    )
                  })}
                </Card>
              </>
            )}

            <div className="flex items-center justify-between">
              <SectionLabel className="mb-0">Meter Records</SectionLabel>
              <Button variant="primary" size="sm" fullWidth={false} onClick={() => setAddMeterOpen(true)}>
                <Plus size={13} /> New Record
              </Button>
            </div>

            {meterReadings.length === 0 ? (
              <Card>
                <EmptyState
                  icon={<Droplets size={32} />}
                  title="No meter records"
                  subtitle="Tap 'New Record' to add the first reading."
                />
              </Card>
            ) : (
              <Card padding={false}>
                {meterReadings.map((reading, ri) => {
                  const waterUsage = reading.waterCurrent - reading.waterPrev
                  const elecUsage  = reading.elecCurrent - reading.elecPrev
                  const isLatest   = ri === 0
                  return (
                    <div key={reading.id}>
                      <div className="px-4 py-2 bg-[#F6F6F6] text-[11px] font-bold text-[#707070]">
                        {new Date(reading.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · {reading.recorder}
                        {isLatest && <span className="ml-2 text-[10px] bg-[#E8F6EF] text-[#1F6F4E] px-1.5 py-0.5 rounded-full font-bold">Latest</span>}
                      </div>
                      {/* Water */}
                      <div className="flex items-center justify-between px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#E8F0FF] flex items-center justify-center">
                            <Droplets size={14} className="text-[#1E40AF]" />
                          </div>
                          <span className="text-[13px] font-bold">Water</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="text-center bg-[#F6F6F6] rounded-lg px-2 py-1">
                            <div className="text-[9px] text-[#707070]">Prev</div>
                            <div className="text-[12px] font-bold">{reading.waterPrev}</div>
                          </div>
                          <span className="text-[10px] text-[#707070]">→</span>
                          <div className="text-center bg-[#F6F6F6] rounded-lg px-2 py-1">
                            <div className="text-[9px] text-[#707070]">Now</div>
                            <div className="text-[12px] font-bold">{reading.waterCurrent}</div>
                          </div>
                          <div className="text-center bg-[#E8F0FF] rounded-lg px-2 py-1">
                            <div className="text-[9px] text-[#707070]">Use</div>
                            <div className="text-[12px] font-bold text-[#2563EB]">+{waterUsage}</div>
                          </div>
                        </div>
                      </div>
                      {/* Electricity */}
                      <div className="flex items-center justify-between px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#FFF3DF] flex items-center justify-center">
                            <Zap size={14} className="text-[#8A6408]" />
                          </div>
                          <span className="text-[13px] font-bold">Electricity</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="text-center bg-[#F6F6F6] rounded-lg px-2 py-1">
                            <div className="text-[9px] text-[#707070]">Prev</div>
                            <div className="text-[12px] font-bold">{reading.elecPrev}</div>
                          </div>
                          <span className="text-[10px] text-[#707070]">→</span>
                          <div className="text-center bg-[#F6F6F6] rounded-lg px-2 py-1">
                            <div className="text-[9px] text-[#707070]">Now</div>
                            <div className="text-[12px] font-bold">{reading.elecCurrent}</div>
                          </div>
                          <div className="text-center bg-[#E8F0FF] rounded-lg px-2 py-1">
                            <div className="text-[9px] text-[#707070]">Use</div>
                            <div className="text-[12px] font-bold text-[#2563EB]">+{elecUsage}</div>
                          </div>
                        </div>
                      </div>
                      {ri < meterReadings.length - 1 && <Divider />}
                    </div>
                  )
                })}
              </Card>
            )}
          </>
        )}

        {/* ─── TAB 2: BILLING ────────────────────────────────── */}
        {tab === 2 && (
          <>
            {occupied && (
              <>
                <SectionLabel>Current Period</SectionLabel>
                <Card className="bg-[#E8F0FF] border-[#2563EB] border-[1.5px]">
                  <div className="flex items-center gap-1.5 text-[12px] text-[#2563EB] font-semibold mb-1">
                    <span>Mar 2026 · Day {dayCounter}/{daysInMonth}</span>
                  </div>
                  <div className="text-[12px] text-[#707070] mb-3">
                    {hasActiveThisMonth ? 'Invoice already created for this period' : 'No invoice yet for this period'}
                  </div>
                  {showStartBill && (
                    <Button onClick={() => setStartBillOpen(true)}>
                      <Zap size={14} /> Start Bill
                    </Button>
                  )}
                </Card>
              </>
            )}

            <div className="flex items-center gap-0 border-b border-[#E3E5EA] -mx-4 px-4 overflow-x-auto scrollbar-hide">
              {BILL_TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setBillFilter(t.key)}
                  className={`flex-1 py-2.5 text-center text-[11px] font-bold border-b-2 -mb-px transition-colors min-w-[60px] ${
                    billFilter === t.key ? 'text-[#2563EB] border-[#2563EB]' : 'text-[#707070] border-transparent'
                  }`}
                >
                  <div>{t.label}</div>
                  <div className={`text-[15px] font-bold ${t.color || 'text-[#1F1F1F]'}`}>{t.count}</div>
                </button>
              ))}
            </div>

            {filteredInvoices.length === 0 ? (
              <div className="text-center py-6 text-[13px] text-[#707070]">No invoices</div>
            ) : (
              <Card padding={false}>
                {filteredInvoices.map((inv, i) => (
                  <div key={inv.id}>
                    <div
                      className="flex items-center justify-between px-4 py-3 cursor-pointer active:opacity-80"
                      onClick={() => navigate(`/invoice/${inv.id}`)}
                    >
                      <div>
                        <div className="text-[14px] font-bold text-[#1F1F1F]">
                          {new Date(inv.periodStart).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-[11px] text-[#707070]">
                          {inv.id} · Due {new Date(inv.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-[14px] font-bold">${inv.total?.toFixed(2)}</div>
                          <Badge variant={invoiceStatusVariant(inv.status)}>{invoiceStatusLabel(inv.status)}</Badge>
                        </div>
                        <ChevronRight size={14} className="text-[#B0B0B0]" />
                      </div>
                    </div>
                    {i < filteredInvoices.length - 1 && <Divider />}
                  </div>
                ))}
              </Card>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <StartBillModal open={startBillOpen} onClose={() => setStartBillOpen(false)} roomId={roomId} onSuccess={() => setStartBillOpen(false)} />
      <AddTenantModal open={addTenantOpen} onClose={() => setAddTenantOpen(false)} roomId={roomId} roomName={room.name} />
      <AddMeterModal open={addMeterOpen} onClose={() => setAddMeterOpen(false)} lastReading={lastReading}
        onConfirm={data => addMeterReading({ roomId, ...data })} />
      <RemoveTenantModal open={removeTenantOpen} onClose={() => setRemoveTenantOpen(false)}
        tenantName={tenant?.name || ''} roomName={room.name}
        onConfirm={reason => { if (contract) removeTenantFromRoom(contract.id, reason) }} />
      <AddServiceModal open={addServiceOpen} onClose={() => setAddServiceOpen(false)} roomId={roomId}
        onSave={svcs => setRoomServices(roomId, svcs)} />
    </div>
  )
}
