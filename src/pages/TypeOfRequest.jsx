import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader'
import { useStore } from '../store'
import { Plus, ChevronRight } from 'lucide-react'

export default function TypeOfRequest() {
  const navigate      = useNavigate()
  const approvalTypes = useStore(s => s.approvalTypes)

  return (
    <div className="app-shell">
      <PageHeader title="Request Type - Team Approval" />

      <div className="page-content scrollbar-hide p-4 space-y-3" style={{ paddingBottom: '96px' }}>
        {approvalTypes.length === 0 && (
          <div className="text-center py-16 text-[13px] text-[#B0B0B0]">No request types yet</div>
        )}

        {approvalTypes.map(type => (
          <button
            key={type.id}
            onClick={() => navigate(`/approval-types/${type.id}`)}
            className="w-full bg-white rounded-xl border border-[#E3E5EA] px-4 py-4 text-left active:opacity-80"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-bold text-[#1F1F1F]">{type.name}</div>
                {type.description ? (
                  <div className="text-[12px] text-[#707070] mt-0.5">{type.description}</div>
                ) : null}
                <div className="flex flex-wrap items-center gap-1 mt-2">
                  {type.steps.map((s, i) => (
                    <span key={i} className="flex items-center gap-0.5">
                      <span className="text-[10px] font-bold bg-[#EAF0FF] text-[#1E3A8A] px-2 py-0.5 rounded-full">
                        {s.role}
                      </span>
                      {s.personInCharge && (
                        <span className="text-[10px] text-[#B0B0B0]">({s.personInCharge})</span>
                      )}
                      {i < type.steps.length - 1 && (
                        <ChevronRight size={10} className="text-[#B0B0B0] mx-0.5" />
                      )}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-[11px] text-[#B0B0B0]">
                  {type.steps.length} step{type.steps.length !== 1 ? 's' : ''}
                </span>
                <ChevronRight size={16} className="text-[#B0B0B0]" />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/approval-types/new')}
        className="fixed bottom-6 right-5 w-14 h-14 rounded-full bg-[#1E3A8A] text-white shadow-lg flex items-center justify-center active:opacity-80 z-40"
      >
        <Plus size={24} />
      </button>
    </div>
  )
}
