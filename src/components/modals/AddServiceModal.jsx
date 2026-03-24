import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Toggle from '../ui/Toggle'
import { useStore } from '../../store'
import { Droplets, Zap, ParkingSquare, Wifi, Brush, Shirt, Package, PawPrint, Box } from 'lucide-react'

const ICON_MAP = {
  Droplets, Zap, ParkingSquare, Wifi, Brush, Shirt, Package, PawPrint, Box,
}

function ServiceIcon({ name, size = 16 }) {
  const Icon = ICON_MAP[name] || Box
  return <Icon size={size} />
}

export default function AddServiceModal({ open, onClose, roomId, onSave }) {
  const masterServices = useStore(s => s.masterServices)
  const roomServices = useStore(s => s.getRoomServices(roomId))
  const allRoomServices = useStore(s => s.roomServices)

  const [localServices, setLocalServices] = useState([])

  useEffect(() => {
    if (!open) return
    // Build state from master services + current room services
    const services = masterServices.map(ms => {
      const existing = allRoomServices.find(rs => rs.roomId === roomId && rs.serviceId === ms.id)
      return {
        serviceId: ms.id,
        name: ms.name,
        icon: ms.icon,
        type: ms.type,
        defaultRate: ms.defaultRate,
        unitLabel: ms.unitLabel,
        enabled: existing?.enabled ?? false,
        priceOverride: existing?.priceOverride ?? '',
      }
    })
    setLocalServices(services)
  }, [open, roomId, masterServices, allRoomServices])

  function toggleService(serviceId) {
    setLocalServices(prev =>
      prev.map(s => s.serviceId === serviceId ? { ...s, enabled: !s.enabled } : s)
    )
  }

  function setOverride(serviceId, value) {
    setLocalServices(prev =>
      prev.map(s => s.serviceId === serviceId ? { ...s, priceOverride: value } : s)
    )
  }

  function handleSave() {
    onSave(localServices)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Room Services">
      <p className="text-[13px] text-[#707070] mb-4">
        Enable services for this room. Optionally set a price override to use instead of the default rate.
      </p>

      <div className="space-y-0">
        {localServices.map((svc, i) => (
          <div key={svc.serviceId}>
            <div className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    svc.type === 'utility' ? 'bg-[#EAF3FF] text-[#1A5FA5]' : 'bg-[#F6F6F6] text-[#707070]'
                  }`}>
                    <ServiceIcon name={svc.icon} size={16} />
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-[#1F1F1F]">{svc.name}</div>
                    <div className="text-[11px] text-[#707070]">
                      Default: ${svc.defaultRate} {svc.unitLabel}
                    </div>
                  </div>
                </div>
                <Toggle on={svc.enabled} onToggle={() => toggleService(svc.serviceId)} />
              </div>

              {svc.enabled && (
                <div className="mt-2.5 ml-10">
                  <label className="text-[12px] font-semibold text-[#707070] mb-1 block">
                    Price Override ({svc.unitLabel})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder={`${svc.defaultRate} (default)`}
                    value={svc.priceOverride}
                    onChange={e => setOverride(svc.serviceId, e.target.value)}
                    className="input-base text-[13px]"
                  />
                </div>
              )}
            </div>
            {i < localServices.length - 1 && (
              <div className="h-px bg-[#E3E5EA]" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-4">
        <Button onClick={handleSave}>Save Services</Button>
      </div>
    </Modal>
  )
}
