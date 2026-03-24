import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import SearchBar from '../components/ui/SearchBar'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import { ChevronRight } from 'lucide-react'

export default function Tenants() {
  const navigate = useNavigate()
  const tenants = useStore(s => s.tenants)

  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return tenants
    const q = search.toLowerCase()
    return tenants.filter(t =>
      t.name.toLowerCase().includes(q) || t.phone.includes(q)
    )
  }, [tenants, search])

  const avatarColors = ['bg-[#FFEDEA] text-[#D64045]', 'bg-[#EDE9FE] text-[#5B21B6]', 'bg-[#E8F6EF] text-[#1F6F4E]', 'bg-[#EAF3FF] text-[#1A5FA5]']

  return (
    <div>
      {/* Header */}
      <div className="bg-white flex-shrink-0">
        <div className="px-4 pt-4 pb-1">
          <h1 className="text-[22px] font-bold text-[#1F1F1F]">Tenants</h1>
        </div>
        <div className="px-4 pb-3">
          <SearchBar
            placeholder="Search name or phone…"
            value={search}
            onChange={setSearch}
          />
        </div>
      </div>

      <div className="p-4">
        <Card padding={false}>
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-[14px] text-[#707070]">No tenants found</div>
          ) : (
            filtered.map((tenant, i) => (
              <div key={tenant.id}>
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer active:opacity-80"
                  onClick={() => navigate(`/tenant/${tenant.id}`)}
                >
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-[18px] flex-shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                    {tenant.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-bold text-[#1F1F1F] truncate">{tenant.name}</div>
                    <div className="text-[12px] text-[#707070]">{tenant.phone}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={tenant.status === 'active' ? 'green' : 'grey'}>
                      {tenant.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                    <ChevronRight size={16} className="text-[#B0B0B0]" />
                  </div>
                </div>
                {i < filtered.length - 1 && <div className="h-px bg-[#E3E5EA] mx-4" />}
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  )
}
