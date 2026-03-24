import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Zap } from 'lucide-react'
import { useStore } from '../store'
import SearchBar from '../components/ui/SearchBar'
import Badge from '../components/ui/Badge'
import DayRing from '../components/ui/DayRing'
import StartBillModal from '../components/modals/StartBillModal'
import { getDayCounter, getDaysInMonth, shouldShowStartBill, formatMonthYear } from '../lib/dayCounter'

export default function Rooms() {
  const navigate = useNavigate()
  const { rooms, buildings, floors, getAllRoomsWithStatus, getInvoicesByRoom } = useStore()

  const [search, setSearch] = useState('')
  const [filterBuilding, setFilterBuilding] = useState('all')
  const [filterFloor, setFilterFloor] = useState('all')
  const [startBillRoomId, setStartBillRoomId] = useState(null)

  const today = new Date()
  const dayCounter = getDayCounter(today)
  const daysInMonth = getDaysInMonth(today)
  const monthLabel = formatMonthYear(today)

  const allRooms = getAllRoomsWithStatus()

  const allFloors = useMemo(() => {
    if (filterBuilding === 'all') return floors
    return floors.filter(f => f.buildingId === filterBuilding)
  }, [filterBuilding, floors])

  const filtered = useMemo(() => {
    return allRooms.filter(({ room, tenant, building, floor }) => {
      if (filterBuilding !== 'all' && room.buildingId !== filterBuilding) return false
      if (filterFloor !== 'all' && room.floorId !== filterFloor) return false
      if (search) {
        const q = search.toLowerCase()
        const matchRoom = room.name.toLowerCase().includes(q)
        const matchTenant = tenant?.name?.toLowerCase().includes(q)
        if (!matchRoom && !matchTenant) return false
      }
      return true
    })
  }, [allRooms, filterBuilding, filterFloor, search])

  function hasActiveInvoiceForPeriod(roomId) {
    const invoices = getInvoicesByRoom(roomId)
    const thisMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
    return invoices.some(inv => {
      const invMonth = inv.periodStart?.slice(0, 7)
      return invMonth === thisMonth && (inv.status === 'progress' || inv.status === 'overdue')
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white flex-shrink-0">
        <div className="flex justify-between items-center px-4 pt-4 pb-1">
          <div>
            <div className="text-[12px] text-[#707070]">{monthLabel}</div>
            <h1 className="text-[22px] font-bold text-[#1F1F1F]">Rooms</h1>
          </div>
          <button
            onClick={() => navigate('/notifications')}
            className="w-9 h-9 rounded-full bg-[#F6F6F6] border border-[#E3E5EA] flex items-center justify-center text-[#707070]"
          >
            <Bell size={18} />
          </button>
        </div>

        {/* Search + filters */}
        <div className="px-4 pb-3 space-y-2">
          <SearchBar
            placeholder="Search room or tenant…"
            value={search}
            onChange={setSearch}
          />
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <select
                value={filterBuilding}
                onChange={e => { setFilterBuilding(e.target.value); setFilterFloor('all') }}
                className="w-full pl-3 pr-8 py-2 rounded-[10px] border border-[#E3E5EA] text-[13px] font-semibold text-[#1F1F1F] bg-white appearance-none cursor-pointer outline-none"
              >
                <option value="all">🏢 All Buildings</option>
                {buildings.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#707070] pointer-events-none">▾</span>
            </div>
            <div className="flex-1 relative">
              <select
                value={filterFloor}
                onChange={e => setFilterFloor(e.target.value)}
                className="w-full pl-3 pr-8 py-2 rounded-[10px] border border-[#E3E5EA] text-[13px] font-semibold text-[#1F1F1F] bg-white appearance-none cursor-pointer outline-none"
              >
                <option value="all">All Floors</option>
                {allFloors.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#707070] pointer-events-none">▾</span>
            </div>
          </div>
        </div>
      </div>

      {/* Room cards */}
      <div className="p-4 space-y-2.5">
        {filtered.map(({ room, tenant, occupied }) => {
          const showStartBill = occupied && shouldShowStartBill(dayCounter) && !hasActiveInvoiceForPeriod(room.id)

          return (
            <div
              key={room.id}
              className="bg-white rounded-xl border border-[#E3E5EA] shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-4"
            >
              <div className="flex justify-between items-start">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => navigate(`/room/${room.id}`)}
                >
                  <div className="text-[15px] font-bold text-[#1F1F1F]">{room.name}</div>
                  {occupied ? (
                    <div className="text-[13px] text-[#707070] mt-0.5">{tenant?.name}</div>
                  ) : (
                    <Badge variant="grey" className="mt-1">Vacant</Badge>
                  )}
                </div>

                {occupied && (
                  <DayRing day={dayCounter} daysInMonth={daysInMonth} />
                )}
              </div>

              {showStartBill && (
                <button
                  className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 bg-[#2563EB] text-white text-[13px] font-semibold rounded-[10px] active:opacity-80"
                  onClick={() => setStartBillRoomId(room.id)}
                >
                  <Zap size={14} /> Start Bill
                </button>
              )}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#707070] text-[14px]">
            No rooms found
          </div>
        )}
      </div>

      {/* Start Bill Modal */}
      {startBillRoomId && (
        <StartBillModal
          open={!!startBillRoomId}
          onClose={() => setStartBillRoomId(null)}
          roomId={startBillRoomId}
          onSuccess={() => setStartBillRoomId(null)}
        />
      )}
    </div>
  )
}
