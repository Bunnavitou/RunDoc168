import { useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { useStore } from '../store'

const CURRENCY_SYMBOLS = { USD: '$', KHR: '៛', KRW: '₩', THB: '฿', EUR: '€', JPY: '¥', SGD: 'S$', CNY: '¥' }

const STATUS_STYLE = {
  pending:  { label: 'Pending',  bg: 'bg-[#FFF3DF]', text: 'text-[#8A6408]',  Icon: Clock       },
  approved: { label: 'Approved', bg: 'bg-[#E8F6EF]', text: 'text-[#1F6F4E]',  Icon: CheckCircle },
  rejected: { label: 'Rejected', bg: 'bg-[#FFEDEA]', text: 'text-[#B12A1B]',  Icon: XCircle     },
}

function RequestRow({ req, symbol, showActions, onApprove, onReject }) {
  const navigate = useNavigate()
  const s = STATUS_STYLE[req.status] || STATUS_STYLE.pending

  return (
    <div
      className="bg-white rounded-xl border border-[#E3E5EA] px-4 py-4 space-y-3 cursor-pointer active:opacity-80"
      onClick={() => navigate(`/request/${req.id}`)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-bold text-[#1F1F1F] leading-snug">{req.title}</div>
          <div className="text-[12px] text-[#707070] mt-0.5">{req.requester} · {req.department}</div>
          <div className="text-[11px] text-[#B0B0B0] mt-0.5">{req.date}</div>
        </div>
        <div className="text-[15px] font-bold text-[#1F1F1F] flex-shrink-0">
          {symbol}{Number(req.amount).toLocaleString('en-US')}
        </div>
      </div>

      {showActions ? (
        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onApprove(req.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#E8F6EF] text-[#1F6F4E] text-[13px] font-bold active:opacity-70"
          >
            <CheckCircle size={15} /> Approve
          </button>
          <button
            onClick={() => onReject(req.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#FFEDEA] text-[#B12A1B] text-[13px] font-bold active:opacity-70"
          >
            <XCircle size={15} /> Reject
          </button>
        </div>
      ) : (
        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
          <s.Icon size={12} /> {s.label}
        </span>
      )}
    </div>
  )
}

export default function Approval() {
  const { requests, currency, approveRequest, rejectRequest } = useStore()
  const symbol = CURRENCY_SYMBOLS[currency] ?? '៛'

  const pending = requests.filter(r => r.status === 'pending')
  const history = requests.filter(r => r.status !== 'pending')

  return (
    <div>
      <div className="bg-white px-4 pt-4 pb-3 border-b border-[#E3E5EA]">
        <h1 className="text-[22px] font-bold text-[#1F1F1F]">Approval</h1>
      </div>

      <div className="p-4 space-y-5" style={{ paddingBottom: '96px' }}>

        <div>
          <div className="flex items-center justify-between mb-2.5">
            <div className="text-[14px] font-bold text-[#1F1F1F]">Pending My Action</div>
            {pending.length > 0 && (
              <span className="text-[11px] font-bold bg-[#EF4444] text-white px-2 py-0.5 rounded-full">
                {pending.length}
              </span>
            )}
          </div>
          {pending.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E3E5EA] px-4 py-8 text-center text-[13px] text-[#B0B0B0]">
              No items pending your approval
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map(req => (
                <RequestRow key={req.id} req={req} symbol={symbol} showActions
                  onApprove={approveRequest} onReject={rejectRequest} />
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="text-[14px] font-bold text-[#1F1F1F] mb-2.5">History</div>
          {history.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E3E5EA] px-4 py-8 text-center text-[13px] text-[#B0B0B0]">
              No approval history
            </div>
          ) : (
            <div className="space-y-3">
              {history.map(req => (
                <RequestRow key={req.id} req={req} symbol={symbol} showActions={false}
                  onApprove={approveRequest} onReject={rejectRequest} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
