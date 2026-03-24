import { Search } from 'lucide-react'

export default function SearchBar({ placeholder = 'Search…', value, onChange, className = '' }) {
  return (
    <div className={`flex items-center gap-2 bg-[#F6F6F6] rounded-[10px] px-3 py-2.5 ${className}`}>
      <Search size={16} className="text-[#707070] flex-shrink-0" />
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 bg-transparent border-none outline-none text-[15px] text-[#1F1F1F] placeholder:text-[#B0B0B0]"
      />
    </div>
  )
}
