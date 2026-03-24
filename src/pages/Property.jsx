import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import PageHeader from '../components/layout/PageHeader'
import Card, { Divider } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { BuildingModal, FloorModal, RoomModal } from '../components/modals/PropertyModals'
import { Plus, Edit2, Trash2, ChevronRight } from 'lucide-react'

export default function Property() {
  const navigate = useNavigate()
  const { buildings, floors, rooms, contracts, deleteBuilding, deleteFloor, deleteRoom } = useStore()

  const [activeBuilding, setActiveBuilding] = useState(buildings[0]?.id || '')
  const [buildingModal, setBuildingModal] = useState({ open: false, existing: null })
  const [floorModal, setFloorModal] = useState({ open: false, existing: null, buildingId: '' })
  const [roomModal, setRoomModal] = useState({ open: false, existing: null, floorId: '', buildingId: '' })
  const [deleteError, setDeleteError] = useState('')

  function handleDeleteBuilding(id) {
    const result = deleteBuilding(id)
    if (result?.error) setDeleteError(result.error)
    else setDeleteError('')
  }

  function handleDeleteFloor(id) {
    const result = deleteFloor(id)
    if (result?.error) setDeleteError(result.error)
    else setDeleteError('')
  }

  function handleDeleteRoom(id) {
    const result = deleteRoom(id)
    if (result?.error) setDeleteError(result.error)
    else setDeleteError('')
  }

  function isRoomOccupied(roomId) {
    return contracts.some(c => c.roomId === roomId && c.status === 'active')
  }

  const currentBuilding = buildings.find(b => b.id === activeBuilding)
  const buildingFloors = floors.filter(f => f.buildingId === activeBuilding)

  return (
    <div className="app-shell">
      <PageHeader
        title="Property Management"
        rightSlot={
          <button
            onClick={() => setBuildingModal({ open: true, existing: null })}
            className="flex items-center gap-1 text-[13px] font-semibold text-[#D64045]"
          >
            <Plus size={16} /> Building
          </button>
        }
      />

      <div className="page-content scrollbar-hide" style={{ paddingBottom: '24px' }}>
        {/* Building tabs */}
        {buildings.length > 0 ? (
          <>
            <div className="flex bg-white border-b border-[#E3E5EA] overflow-x-auto scrollbar-hide px-4">
              {buildings.map(b => (
                <button
                  key={b.id}
                  onClick={() => setActiveBuilding(b.id)}
                  className={`px-4 py-3 text-[13px] font-bold border-b-2 -mb-px whitespace-nowrap flex-shrink-0 transition-colors ${
                    activeBuilding === b.id ? 'text-[#D64045] border-[#D64045]' : 'text-[#707070] border-transparent'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>

            <div className="p-4 space-y-4">
              {/* Building info */}
              {currentBuilding && (
                <Card>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[16px] font-bold text-[#1F1F1F]">{currentBuilding.name}</div>
                      {currentBuilding.remark && (
                        <div className="text-[13px] text-[#707070] mt-0.5">{currentBuilding.remark}</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setBuildingModal({ open: true, existing: currentBuilding })}
                        className="w-8 h-8 rounded-lg bg-[#F6F6F6] flex items-center justify-center text-[#707070]">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDeleteBuilding(currentBuilding.id)}
                        className="w-8 h-8 rounded-lg bg-[#FFEDEA] flex items-center justify-center text-[#B12A1B]">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </Card>
              )}

              {deleteError && (
                <div className="bg-[#FFEDEA] rounded-xl p-3 text-[13px] text-[#B12A1B]">{deleteError}</div>
              )}

              {/* Floors + rooms */}
              {buildingFloors.length === 0 ? (
                <div className="text-center py-6 text-[13px] text-[#707070]">No floors. Add a floor to get started.</div>
              ) : (
                buildingFloors.map(floor => {
                  const floorRooms = rooms.filter(r => r.floorId === floor.id)
                  return (
                    <div key={floor.id}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-[13px] font-bold text-[#1F1F1F]">{floor.name}</span>
                          {floor.remark && <span className="text-[12px] text-[#707070] ml-1.5">· {floor.remark}</span>}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setRoomModal({ open: true, existing: null, floorId: floor.id, buildingId: activeBuilding })}
                            className="flex items-center gap-1 text-[12px] font-semibold text-[#D64045]"
                          >
                            <Plus size={13} /> Room
                          </button>
                          <button onClick={() => setFloorModal({ open: true, existing: floor, buildingId: activeBuilding })}
                            className="w-7 h-7 rounded-lg bg-[#F6F6F6] flex items-center justify-center text-[#707070]">
                            <Edit2 size={12} />
                          </button>
                          <button onClick={() => handleDeleteFloor(floor.id)}
                            className="w-7 h-7 rounded-lg bg-[#FFEDEA] flex items-center justify-center text-[#B12A1B]">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <Card padding={false}>
                        {floorRooms.length === 0 ? (
                          <div className="px-4 py-3 text-[13px] text-[#707070]">No rooms on this floor</div>
                        ) : (
                          floorRooms.map((room, i) => {
                            const occupied = isRoomOccupied(room.id)
                            return (
                              <div key={room.id}>
                                <div className="flex items-center justify-between px-4 py-3">
                                  <div
                                    className="flex-1 cursor-pointer"
                                    onClick={() => navigate(`/room/${room.id}`)}
                                  >
                                    <div className="text-[14px] font-bold text-[#1F1F1F]">{room.name}</div>
                                    <div className="text-[12px] text-[#707070]">{room.size} · ${room.price}/mo</div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant={occupied ? 'green' : 'grey'}>
                                      {occupied ? 'Occupied' : 'Vacant'}
                                    </Badge>
                                    <button onClick={() => setRoomModal({ open: true, existing: room, floorId: room.floorId, buildingId: room.buildingId })}
                                      className="w-7 h-7 rounded-lg bg-[#F6F6F6] flex items-center justify-center text-[#707070]">
                                      <Edit2 size={12} />
                                    </button>
                                    {!occupied && (
                                      <button onClick={() => handleDeleteRoom(room.id)}
                                        className="w-7 h-7 rounded-lg bg-[#FFEDEA] flex items-center justify-center text-[#B12A1B]">
                                        <Trash2 size={12} />
                                      </button>
                                    )}
                                    <ChevronRight size={14} className="text-[#B0B0B0]" onClick={() => navigate(`/room/${room.id}`)} />
                                  </div>
                                </div>
                                {i < floorRooms.length - 1 && <Divider />}
                              </div>
                            )
                          })
                        )}
                      </Card>
                    </div>
                  )
                })
              )}

              <Button
                variant="outline"
                onClick={() => setFloorModal({ open: true, existing: null, buildingId: activeBuilding })}
              >
                <Plus size={14} /> Add Floor
              </Button>
            </div>
          </>
        ) : (
          <div className="p-4 text-center text-[#707070] py-12">
            <div className="text-[14px] font-bold mb-1">No Buildings Yet</div>
            <div className="text-[13px]">Tap "+ Building" to create your first building.</div>
          </div>
        )}
      </div>

      <BuildingModal
        open={buildingModal.open}
        onClose={() => setBuildingModal({ open: false, existing: null })}
        existing={buildingModal.existing}
      />
      <FloorModal
        open={floorModal.open}
        onClose={() => setFloorModal({ open: false, existing: null, buildingId: '' })}
        existing={floorModal.existing}
        buildingId={floorModal.buildingId}
      />
      <RoomModal
        open={roomModal.open}
        onClose={() => setRoomModal({ open: false, existing: null, floorId: '', buildingId: '' })}
        existing={roomModal.existing}
        floorId={roomModal.floorId}
        buildingId={roomModal.buildingId}
      />
    </div>
  )
}
