import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import PageHeader from '../components/layout/PageHeader'
import Badge, { invoiceStatusVariant, invoiceStatusLabel } from '../components/ui/Badge'
import Card, { Divider } from '../components/ui/Card'
import Button from '../components/ui/Button'
import MarkPaidModal from '../components/modals/MarkPaidModal'
import CancelInvoiceModal from '../components/modals/CancelInvoiceModal'
import { formatUSD, formatKHR } from '../lib/billing'
import { QrCode, Share2, CheckCircle2, Banknote } from 'lucide-react'

function LineRow({ label, detail, amount, highlight }) {
  return (
    <div className={`flex items-start justify-between py-2.5 ${highlight ? 'bg-[#F6F6F6] -mx-4 px-4 rounded-lg' : ''}`}>
      <div className="flex-1 min-w-0 mr-3">
        <div className="text-[13px] font-semibold text-[#1F1F1F]">{label}</div>
        {detail && <div className="text-[11px] text-[#707070] mt-0.5">{detail}</div>}
      </div>
      <div className="text-[13px] font-bold text-[#1F1F1F] flex-shrink-0">{amount}</div>
    </div>
  )
}

export default function InvoiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getInvoiceById, markInvoicePaid, cancelInvoice, exchangeRate } = useStore()

  const [markPaidOpen, setMarkPaidOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  const inv = getInvoiceById(id)

  if (!inv) {
    return (
      <div className="app-shell">
        <PageHeader title="Invoice Not Found" />
        <div className="p-4 text-center text-[#707070]">Invoice not found.</div>
      </div>
    )
  }

  const waterUsage = Math.max(0, inv.waterCurrent - inv.waterPrev)
  const elecUsage  = Math.max(0, inv.elecCurrent - inv.elecPrev)
  const waterAmt   = waterUsage * inv.waterRate
  const elecAmt    = elecUsage * inv.elecRate

  const periodStart = new Date(inv.periodStart)
  const periodEnd   = new Date(inv.periodEnd)
  const billDays    = Math.round((periodEnd - periodStart) / 86400000) + 1
  const daysInMonth = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0).getDate()
  const rentAmt     = inv.baseRent * (billDays / daysInMonth)

  const fmtDate = d => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  const canPay    = inv.status === 'progress' || inv.status === 'overdue'
  const canCancel = inv.status !== 'cancelled' && inv.status !== 'paid'
  const isPaid    = inv.status === 'paid'

  return (
    <div className="app-shell">
      <PageHeader
        title={inv.id}
        subtitle={`${inv.roomSnapshot?.name} · ${inv.roomSnapshot?.building}`}
        rightSlot={
          <Badge variant={invoiceStatusVariant(inv.status)}>
            {invoiceStatusLabel(inv.status)}
          </Badge>
        }
      />

      <div className="page-content scrollbar-hide p-4 space-y-4" style={{ paddingBottom: '24px' }}>

        {/* QR block for unpaid invoices */}
        {canPay && (
          <Card className="flex flex-col items-center py-5">
            <QrCode size={80} className="text-[#1F1F1F] mb-2" strokeWidth={1} />
            <div className="text-[12px] text-[#707070]">Scan to pay</div>
          </Card>
        )}

        {/* Paid confirmation */}
        {isPaid && (
          <Card className="bg-[#E8F6EF] border-[#1F6F4E]">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={18} className="text-[#1F6F4E]" />
              <span className="text-[14px] font-bold text-[#1F6F4E]">Payment Received</span>
            </div>
            <div className="text-[13px] text-[#707070]">
              Method: <span className="font-semibold text-[#1F1F1F]">{inv.paymentMethod}</span>
            </div>
            {inv.paidAt && (
              <div className="text-[13px] text-[#707070]">
                Paid on: <span className="font-semibold text-[#1F1F1F]">{fmtDate(inv.paidAt)}</span>
              </div>
            )}
          </Card>
        )}

        {/* Invoice info */}
        <Card>
          <div className="space-y-0">
            {[
              { label: 'Tenant',      value: inv.tenantSnapshot?.name },
              { label: 'Phone',       value: inv.tenantSnapshot?.phone },
              { label: 'Room',        value: `${inv.roomSnapshot?.name} · ${inv.roomSnapshot?.floor}` },
              { label: 'Bill Period', value: `${fmtDate(inv.periodStart)} – ${fmtDate(inv.periodEnd)}` },
              { label: 'Due Date',    value: fmtDate(inv.dueDate) },
            ].map((row, i, arr) => (
              <div key={row.label}>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-[13px] text-[#707070]">{row.label}</span>
                  <span className="text-[13px] font-semibold text-[#1F1F1F] text-right max-w-[55%]">{row.value}</span>
                </div>
                {i < arr.length - 1 && <Divider />}
              </div>
            ))}
          </div>
        </Card>

        {/* Line items */}
        <Card>
          <div className="text-[11px] font-semibold text-[#707070] uppercase tracking-wide mb-2">Line Items</div>

          <Divider className="mb-1" />

          <LineRow
            label="Base Rent"
            detail={billDays !== daysInMonth ? `${billDays}/${daysInMonth} days (prorated)` : `${billDays} days (full month)`}
            amount={formatUSD(rentAmt)}
          />
          <Divider />

          <LineRow
            label="Water"
            detail={`${inv.waterPrev} → ${inv.waterCurrent} (${waterUsage} m³ × $${inv.waterRate})`}
            amount={formatUSD(waterAmt)}
          />
          <Divider />

          <LineRow
            label="Electricity"
            detail={`${inv.elecPrev} → ${inv.elecCurrent} (${elecUsage} kWh × $${inv.elecRate})`}
            amount={formatUSD(elecAmt)}
          />

          {(inv.fixedServices || []).map(svc => (
            <div key={svc.serviceId}>
              <Divider />
              <LineRow label={svc.name} detail="Fixed / month" amount={formatUSD(svc.amount)} />
            </div>
          ))}

          <Divider className="my-2" />

          {/* Totals */}
          <div className="flex justify-between py-1.5">
            <span className="text-[13px] text-[#707070]">Subtotal</span>
            <span className="text-[13px] font-bold">{formatUSD(inv.subtotal)}</span>
          </div>

          <div className="flex justify-between py-1.5">
            <span className="text-[12px] text-[#707070]">Security Deposit (ref.)</span>
            <span className="text-[12px] text-[#707070]">{formatUSD(inv.securityDeposit)}</span>
          </div>

          <div className="bg-[#E8F0FF] -mx-4 px-4 py-3 rounded-b-xl mt-2">
            <div className="flex justify-between items-center">
              <span className="text-[15px] font-bold text-[#1F1F1F]">Total Due</span>
              <span className="text-[18px] font-bold text-[#2563EB]">{formatUSD(inv.total)}</span>
            </div>
            <div className="text-[11px] text-[#707070] mt-0.5 text-right">
              ≈ {formatKHR(inv.total, inv.exchangeRate || exchangeRate)} @ {inv.exchangeRate || exchangeRate} ៛/$
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-2">
          {isPaid && (
            <Button variant="outline">
              <Share2 size={16} /> Share Receipt
            </Button>
          )}
          {canPay && (
            <Button onClick={() => setMarkPaidOpen(true)}>
              <Banknote size={16} /> Mark as Paid
            </Button>
          )}
          {canCancel && (
            <Button variant="danger" onClick={() => setCancelOpen(true)}>
              Cancel Invoice
            </Button>
          )}
        </div>
      </div>

      <MarkPaidModal
        open={markPaidOpen}
        onClose={() => setMarkPaidOpen(false)}
        onConfirm={method => markInvoicePaid(id, method)}
      />

      <CancelInvoiceModal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={reason => { cancelInvoice(id, reason); navigate(-1) }}
      />
    </div>
  )
}
