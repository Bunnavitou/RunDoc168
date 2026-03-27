import { useState } from 'react'
import { useParams } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader'
import { MOCK_APPROVAL_STEPS, MOCK_COMMENTS, APPROVAL_TYPES } from '../lib/mockData'
import { useStore } from '../store'
import { Paperclip, CheckCircle, Clock, XCircle, Send, AlertCircle, ChevronRight, Camera } from 'lucide-react'

const CURRENCY_SYMBOLS = { USD: '$', KHR: '៛', KRW: '₩', THB: '฿', EUR: '€', JPY: '¥', SGD: 'S$', CNY: '¥' }

const TABS = ['Overview', 'Approval Line', 'Comment']

const STATUS_STYLE = {
  pending:  { label: 'Pending',  bg: 'bg-[#FFF3DF]', text: 'text-[#8A6408]',  Icon: Clock        },
  approved: { label: 'Approved', bg: 'bg-[#E8F6EF]', text: 'text-[#1F6F4E]',  Icon: CheckCircle  },
  rejected: { label: 'Rejected', bg: 'bg-[#FFEDEA]', text: 'text-[#B12A1B]',  Icon: XCircle      },
}

// ── Shared helpers ────────────────────────────────────────────────────────────
function SectionBlock({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-[#E3E5EA] overflow-hidden">
      <div className="px-4 py-3 bg-[#F6F6F6] border-b border-[#E3E5EA]">
        <div className="text-[11px] font-bold text-[#707070] uppercase tracking-wider">{title}</div>
      </div>
      <div className="divide-y divide-[#F0F0F0]">{children}</div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 gap-4">
      <span className="text-[12px] text-[#707070] flex-shrink-0">{label}</span>
      <span className="text-[13px] font-semibold text-[#1F1F1F] text-right">{value || '—'}</span>
    </div>
  )
}

// ── Overview Tab ──────────────────────────────────────────────────────────────
function OverviewTab({ req, symbol }) {
  const s            = STATUS_STYLE[req.status] || STATUS_STYLE.pending
  const approvalType = APPROVAL_TYPES.find(t => t.id === req.approvalTypeId)
  // Support both old format (unitPrice*qty) and new format (amount per line)
  const grandTotal   = req.items?.reduce((sum, i) => sum + (i.amount ?? i.unitPrice * i.qty), 0) ?? req.amount

  return (
    <div className="p-4 space-y-4" style={{ paddingBottom: '32px' }}>

      {/* Amount + status hero */}
      <div className="bg-white rounded-xl border border-[#E3E5EA] px-5 py-4 flex items-center justify-between">
        <div>
          <div className="text-[12px] text-[#707070]">Requested Amount</div>
          <div className="text-[28px] font-bold text-[#1F1F1F] mt-0.5">{symbol}{Number(grandTotal).toLocaleString('en-US')}</div>
        </div>
        <span className={`flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 rounded-full ${s.bg} ${s.text}`}>
          <s.Icon size={14} /> {s.label}
        </span>
      </div>

      {/* Section 1 — Request Information */}
      <SectionBlock title="1  Request Information">
        <InfoRow label="Request No."  value={req.requestNo || req.id} />
        <InfoRow label="Expense Category" value={req.department} />
      </SectionBlock>

      {/* Requester Information (separate) */}
      <SectionBlock title="Requester Information">
        <InfoRow label="Requester"  value={req.requester} />
        <InfoRow label="Date"       value={req.date} />
      </SectionBlock>

      {/* Section 2 — Expense Items */}
      {req.items && req.items.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E3E5EA] overflow-hidden">
          <div className="px-4 py-3 bg-[#F6F6F6] border-b border-[#E3E5EA]">
            <div className="text-[11px] font-bold text-[#707070] uppercase tracking-wider">2  Expense Items</div>
          </div>
          {/* Column header */}
          <div className="flex items-center px-4 py-2 border-b border-[#F0F0F0]">
            <div className="flex-1 text-[10px] font-bold text-[#B0B0B0] uppercase tracking-wide">Item</div>
            <div className="w-20 text-right text-[10px] font-bold text-[#B0B0B0] uppercase">Total</div>
          </div>
          {req.items.map((item, i) => {
            const lineTotal = item.amount ?? (item.unitPrice * item.qty)
            return (
              <div key={i} className={`flex items-center px-4 py-3 ${i < req.items.length - 1 ? 'border-b border-[#F0F0F0]' : ''}`}>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-[#1F1F1F] leading-snug">{item.name}</div>
                  {item.budgetCode && (
                    <div className="text-[10px] text-[#B0B0B0] font-mono mt-0.5">{item.budgetCode}</div>
                  )}
                </div>
                <div className="text-right text-[13px] font-bold text-[#1F1F1F]">
                  {symbol}{Number(lineTotal).toLocaleString('en-US')}
                </div>
              </div>
            )
          })}
          <div className="flex items-center justify-between px-4 py-3 bg-[#F6F6F6] border-t border-[#E3E5EA]">
            <span className="text-[12px] font-bold text-[#707070]">Grand Total</span>
            <span className="text-[16px] font-bold text-[#1E3A8A]">{symbol}{Number(grandTotal).toLocaleString('en-US')}</span>
          </div>
        </div>
      )}

      {/* Section 3 — Type of Request */}
      {approvalType && (
        <div className="bg-white rounded-xl border border-[#E3E5EA] px-4 py-4">
          <div className="text-[11px] font-bold text-[#707070] uppercase tracking-wider mb-3">3  Type of Request</div>
          <div className="text-[14px] font-bold text-[#1F1F1F]">{approvalType.name}</div>
          <div className="text-[11px] text-[#707070] mt-0.5">{approvalType.description}</div>
          <div className="flex items-center gap-1 mt-3 flex-wrap">
            {approvalType.steps.map((step, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF0FF] text-[#1E3A8A]">{step.role ?? step}</span>
                {i < approvalType.steps.length - 1 && (
                  <ChevronRight size={10} className="text-[#B0B0B0]" />
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Section 4 — Remark */}
      <div className="bg-white rounded-xl border border-[#E3E5EA] px-4 py-4 space-y-3">
        <div className="text-[11px] font-bold text-[#707070] uppercase tracking-wider">4  Remark</div>
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[#707070]">Priority</span>
          <span className={`flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full ${
            req.priority === 'urgent'
              ? 'bg-[#FFEDEA] text-[#B12A1B]'
              : 'bg-[#EAF0FF] text-[#1E3A8A]'
          }`}>
            {req.priority === 'urgent' && <AlertCircle size={11} />}
            {req.priority === 'urgent' ? 'Urgent' : 'Normal'}
          </span>
        </div>
        {req.note ? (
          <div className="bg-[#F6F6F6] rounded-xl px-3 py-2.5 text-[13px] text-[#707070] leading-relaxed">
            {req.note}
          </div>
        ) : (
          <div className="text-[12px] text-[#B0B0B0] italic">No note added</div>
        )}
      </div>

      {/* Section 5 — Attachments */}
      <div className="bg-white rounded-xl border border-[#E3E5EA] px-4 py-4">
        <div className="text-[11px] font-bold text-[#707070] uppercase tracking-wider mb-3">5  Attachments</div>
        {req.photos && req.photos.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {req.photos.map((p, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden border border-[#E3E5EA]">
                <img src={p} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        ) : req.attachments > 0 ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EAF0FF] flex items-center justify-center flex-shrink-0">
              <Paperclip size={16} className="text-[#1E3A8A]" />
            </div>
            <div>
              <div className="text-[13px] font-bold text-[#1F1F1F]">{req.attachments} File{req.attachments > 1 ? 's' : ''}</div>
              <div className="text-[11px] text-[#707070]">Tap to view</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[12px] text-[#B0B0B0]">
            <Camera size={14} /> No attachments
          </div>
        )}
      </div>

    </div>
  )
}

// ── Approval Line Tab ─────────────────────────────────────────────────────────
// Simulates that the logged-in user IS the approver for whichever step is pending
function ApprovalLineTab() {
  const [steps, setSteps]       = useState(MOCK_APPROVAL_STEPS)
  const [acting, setActing]     = useState(null)  // step number being actioned
  const [actionType, setActionType] = useState(null) // 'approve' | 'reject'
  const [remark, setRemark]     = useState('')

  const pendingStep = steps.find(s => s.status === 'pending')

  function startAction(stepNum, type) {
    setActing(stepNum)
    setActionType(type)
    setRemark('')
  }

  function cancelAction() {
    setActing(null)
    setActionType(null)
    setRemark('')
  }

  function confirmAction() {
    const today = new Date().toISOString().slice(0, 10)
    setSteps(prev => prev.map(s =>
      s.step === acting
        ? { ...s, status: actionType === 'approve' ? 'approved' : 'rejected', date: today, remark }
        : s
    ))
    cancelAction()
  }

  return (
    <div className="p-4 space-y-0" style={{ paddingBottom: '32px' }}>
      {steps.map((step, i) => {
        const isLast      = i === steps.length - 1
        const isMyTurn    = pendingStep && step.step === pendingStep.step
        const isActioning = acting === step.step

        const dotColor =
          step.status === 'approved' ? 'bg-[#22C55E] border-[#22C55E]' :
          step.status === 'rejected' ? 'bg-[#EF4444] border-[#EF4444]' :
          isMyTurn ? 'bg-[#1E3A8A] border-[#1E3A8A]' :
          'bg-white border-[#D1D5DB]'

        const IconComp =
          step.status === 'approved' ? CheckCircle :
          step.status === 'rejected' ? XCircle     : Clock

        return (
          <div key={step.step} className="flex gap-4">
            {/* Timeline dot + line */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10 ${dotColor}`}>
                <IconComp
                  size={16}
                  className={
                    step.status === 'approved' ? 'text-white' :
                    step.status === 'rejected' ? 'text-white' :
                    isMyTurn ? 'text-white' : 'text-[#B0B0B0]'
                  }
                />
              </div>
              {!isLast && <div className="w-0.5 flex-1 bg-[#E3E5EA] my-1 min-h-[24px]" />}
            </div>

            {/* Card */}
            <div className={`flex-1 ${!isLast ? 'pb-5' : 'pb-0'}`}>
              <div className={`bg-white rounded-xl border px-4 py-3.5 space-y-2 ${
                isMyTurn ? 'border-[#1E3A8A]' : 'border-[#E3E5EA]'
              }`}>
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-bold text-[#707070] uppercase tracking-wide">
                      Step {step.step} · {step.role}
                    </div>
                    <div className="text-[14px] font-bold text-[#1F1F1F] mt-0.5">{step.name}</div>
                  </div>
                  {step.status !== 'pending' && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      step.status === 'approved' ? 'bg-[#E8F6EF] text-[#1F6F4E]' : 'bg-[#FFEDEA] text-[#B12A1B]'
                    }`}>
                      {step.status === 'approved' ? 'Approved' : 'Rejected'}
                    </span>
                  )}
                  {isMyTurn && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF0FF] text-[#1E3A8A] flex-shrink-0">
                      Your Turn
                    </span>
                  )}
                </div>

                {/* Date */}
                {step.date && (
                  <div className="text-[11px] text-[#B0B0B0]">{step.date}</div>
                )}

                {/* Remark */}
                {step.remark ? (
                  <div className="text-[12px] text-[#707070] bg-[#F6F6F6] rounded-xl px-3 py-2">
                    "{step.remark}"
                  </div>
                ) : step.status === 'pending' && !isMyTurn ? (
                  <div className="text-[12px] text-[#B0B0B0] italic">Waiting for approval…</div>
                ) : null}

                {/* ── Action area — only shown when it's the user's turn ── */}
                {isMyTurn && !isActioning && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => startAction(step.step, 'approve')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#E8F6EF] text-[#1F6F4E] text-[13px] font-bold active:opacity-70"
                    >
                      <CheckCircle size={15} /> Approve
                    </button>
                    <button
                      onClick={() => startAction(step.step, 'reject')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#FFEDEA] text-[#B12A1B] text-[13px] font-bold active:opacity-70"
                    >
                      <XCircle size={15} /> Reject
                    </button>
                  </div>
                )}

                {/* ── Confirm panel ── */}
                {isActioning && (
                  <div className="pt-1 space-y-2">
                    <div className={`text-[12px] font-bold px-3 py-1.5 rounded-lg text-center ${
                      actionType === 'approve' ? 'bg-[#E8F6EF] text-[#1F6F4E]' : 'bg-[#FFEDEA] text-[#B12A1B]'
                    }`}>
                      {actionType === 'approve' ? 'Approving this step' : 'Rejecting this step'}
                    </div>
                    <textarea
                      placeholder="Add a remark (optional)..."
                      value={remark}
                      onChange={e => setRemark(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 text-[13px] text-[#1F1F1F] bg-[#F6F6F6] rounded-xl outline-none resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={cancelAction}
                        className="flex-1 py-2.5 rounded-xl border border-[#E3E5EA] text-[13px] font-semibold text-[#707070] active:opacity-70"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={confirmAction}
                        className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white active:opacity-70 ${
                          actionType === 'approve' ? 'bg-[#22C55E]' : 'bg-[#EF4444]'
                        }`}
                      >
                        Confirm {actionType === 'approve' ? 'Approve' : 'Reject'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Comment Tab ───────────────────────────────────────────────────────────────
function CommentTab() {
  const [text, setText] = useState('')
  const [comments, setComments] = useState(MOCK_COMMENTS)

  function sendComment() {
    if (!text.trim()) return
    setComments(prev => [
      ...prev,
      {
        id: `c${Date.now()}`,
        author: 'Me',
        role: 'Requester',
        text: text.trim(),
        date: new Date().toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }).replace(',', ''),
      },
    ])
    setText('')
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
      {/* Comment list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        {comments.map(c => (
          <div key={c.id} className={`flex flex-col ${c.author === 'Me' ? 'items-end' : 'items-start'}`}>
            <div className="text-[10px] text-[#B0B0B0] mb-1">{c.author} · {c.role}</div>
            <div className={`max-w-[80%] px-4 py-2.5 rounded-xl text-[13px] leading-relaxed ${
              c.author === 'Me'
                ? 'bg-[#1E3A8A] text-white rounded-br-sm'
                : 'bg-white border border-[#E3E5EA] text-[#1F1F1F] rounded-bl-sm'
            }`}>
              {c.text}
            </div>
            <div className="text-[10px] text-[#B0B0B0] mt-1">{c.date}</div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white border-t border-[#E3E5EA] flex items-center gap-2">
        <input
          type="text"
          placeholder="Write a comment…"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendComment()}
          className="flex-1 bg-[#F6F6F6] rounded-xl px-3 py-2.5 text-[14px] text-[#1F1F1F] outline-none"
        />
        <button
          onClick={sendComment}
          className="w-10 h-10 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center flex-shrink-0 active:opacity-80 disabled:opacity-40"
          disabled={!text.trim()}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function RequestDetail() {
  const { id } = useParams()
  const { requests, currency } = useStore()
  const symbol = CURRENCY_SYMBOLS[currency] ?? '៛'
  const [activeTab, setActiveTab] = useState('Overview')

  const req = requests.find(r => r.id === id) || requests[0]

  return (
    <div className="app-shell">
      <PageHeader title={req.title} subtitle={`#${req.id}`} />

      {/* Sub-tabs */}
      <div className="flex bg-white border-b border-[#E3E5EA] px-4 gap-1">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-3 py-3 text-[13px] font-semibold border-b-2 transition-colors flex-shrink-0 ${
              activeTab === t
                ? 'border-[#1E3A8A] text-[#1E3A8A]'
                : 'border-transparent text-[#707070]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="overflow-y-auto scrollbar-hide flex-1">
        {activeTab === 'Overview'      && <OverviewTab req={req} symbol={symbol} />}
        {activeTab === 'Approval Line' && <ApprovalLineTab />}
        {activeTab === 'Comment'       && <CommentTab />}
      </div>
    </div>
  )
}
