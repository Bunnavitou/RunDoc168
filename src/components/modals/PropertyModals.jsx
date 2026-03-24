import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { useStore } from '../../store'

// ── New/Edit Building ──────────────────────────────────────────────────────

export function BuildingModal({ open, onClose, existing }) {
  const addBuilding = useStore(s => s.addBuilding)
  const updateBuilding = useStore(s => s.updateBuilding)
  const [name, setName] = useState('')
  const [remark, setRemark] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setName(existing?.name || '')
      setRemark(existing?.remark || '')
      setError('')
    }
  }, [open, existing])

  function handleSubmit() {
    if (!name.trim()) { setError('Building name is required'); return }
    if (existing) {
      updateBuilding(existing.id, { name: name.trim(), remark: remark.trim() })
    } else {
      addBuilding({ name: name.trim(), remark: remark.trim() })
    }
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={existing ? 'Edit Building' : 'New Building'}>
      <Input label="Building Name" placeholder="e.g. Block D" value={name} onChange={e => setName(e.target.value)} error={error} />
      <Input label="Remark (optional)" placeholder="e.g. North wing" value={remark} onChange={e => setRemark(e.target.value)} />
      <Button onClick={handleSubmit}>{existing ? 'Save Changes' : 'Create Building'}</Button>
    </Modal>
  )
}

// ── New/Edit Floor ─────────────────────────────────────────────────────────

export function FloorModal({ open, onClose, existing, buildingId }) {
  const addFloor = useStore(s => s.addFloor)
  const updateFloor = useStore(s => s.updateFloor)
  const [name, setName] = useState('')
  const [remark, setRemark] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setName(existing?.name || '')
      setRemark(existing?.remark || '')
      setError('')
    }
  }, [open, existing])

  function handleSubmit() {
    if (!name.trim()) { setError('Floor name is required'); return }
    if (existing) {
      updateFloor(existing.id, { name: name.trim(), remark: remark.trim() })
    } else {
      addFloor({ buildingId, name: name.trim(), remark: remark.trim() })
    }
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={existing ? 'Edit Floor' : 'New Floor'}>
      <Input label="Floor Name" placeholder="e.g. Floor 4" value={name} onChange={e => setName(e.target.value)} error={error} />
      <Input label="Remark (optional)" placeholder="e.g. Rooftop level" value={remark} onChange={e => setRemark(e.target.value)} />
      <Button onClick={handleSubmit}>{existing ? 'Save Changes' : 'Create Floor'}</Button>
    </Modal>
  )
}

// ── New/Edit Room ──────────────────────────────────────────────────────────

export function RoomModal({ open, onClose, existing, floorId, buildingId }) {
  const addRoom = useStore(s => s.addRoom)
  const updateRoom = useStore(s => s.updateRoom)
  const [name, setName] = useState('')
  const [size, setSize] = useState('')
  const [price, setPrice] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      setName(existing?.name || '')
      setSize(existing?.size || '')
      setPrice(existing?.price || '')
      setErrors({})
    }
  }, [open, existing])

  function handleSubmit() {
    const errs = {}
    if (!name.trim()) errs.name = 'Room name is required'
    if (!size.trim()) errs.size = 'Room size is required'
    if (!price || parseFloat(price) <= 0) errs.price = 'Price is required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    if (existing) {
      updateRoom(existing.id, { name: name.trim(), size: size.trim(), price: parseFloat(price) })
    } else {
      addRoom({ floorId, buildingId, name: name.trim(), size: size.trim(), price: parseFloat(price) })
    }
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={existing ? 'Edit Room' : 'New Room'}>
      <Input label="Room Name" placeholder="e.g. Room 105" value={name} onChange={e => setName(e.target.value)} error={errors.name} />
      <Input label="Room Size" placeholder="e.g. 28 sqm" value={size} onChange={e => setSize(e.target.value)} error={errors.size} />
      <Input label="Price / Month ($)" type="number" placeholder="e.g. 650" value={price} onChange={e => setPrice(e.target.value)} error={errors.price} />
      <Button onClick={handleSubmit}>{existing ? 'Save Changes' : 'Create Room'}</Button>
    </Modal>
  )
}
