import { useRef, useState } from 'react'
import { useStore } from '../store'
import PageHeader from '../components/layout/PageHeader'
import { ImagePlus, X, FileText, AlignLeft, QrCode, Hash, Eye } from 'lucide-react'
import { formatUSD, formatKHR } from '../lib/billing'

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-[#2563EB]' : 'bg-[#D1D5DB]'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  )
}

// ── Section card wrapper ──────────────────────────────────────────────────────
function SectionCard({ icon: Icon, iconBg, iconColor, title, enabled, onToggle, children }) {
  return (
    <div className="bg-white rounded-xl border border-[#E3E5EA] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
            <Icon size={18} className={iconColor} />
          </div>
          <span className="text-[14px] font-bold text-[#1F1F1F]">{title}</span>
        </div>
        <Toggle value={enabled} onChange={onToggle} />
      </div>
      {enabled && (
        <div className="border-t border-[#E3E5EA] px-4 py-3.5 space-y-3">
          {children}
        </div>
      )}
    </div>
  )
}

// ── Text field ────────────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, type = 'text', textarea = false }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-[#707070] uppercase tracking-[0.4px] mb-1 block">{label}</label>
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 rounded-lg border-[1.5px] border-[#E3E5EA] text-[13px] text-[#1F1F1F] outline-none resize-none focus:border-[#2563EB] bg-white"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 rounded-lg border-[1.5px] border-[#E3E5EA] text-[13px] text-[#1F1F1F] outline-none focus:border-[#2563EB] bg-white"
        />
      )}
    </div>
  )
}

// ── Image uploader ────────────────────────────────────────────────────────────
function ImageUploader({ label, value, onChange, circular = false }) {
  const inputRef = useRef(null)
  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => onChange(ev.target.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }
  return (
    <div>
      <label className="text-[11px] font-semibold text-[#707070] uppercase tracking-[0.4px] mb-2 block">{label}</label>
      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="uploaded"
            className={`object-cover border border-[#E3E5EA] ${circular ? 'w-20 h-20 rounded-full' : 'w-32 h-20 rounded-xl'}`}
          />
          <button
            onClick={() => onChange(null)}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#B12A1B] text-white rounded-full flex items-center justify-center"
          >
            <X size={10} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-1.5 border-[1.5px] border-dashed border-[#D1D5DB] bg-[#F6F6F6] text-[#707070] active:opacity-70 transition-opacity ${
            circular ? 'w-20 h-20 rounded-full' : 'w-full h-20 rounded-xl'
          }`}
        >
          <ImagePlus size={20} />
          <span className="text-[11px] font-semibold">Upload</span>
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}

// ── Sample invoice data for preview ──────────────────────────────────────────
const SAMPLE_INV = {
  id: 'INV-24032026-000001',
  tenantName: 'Somchai Kongchai',
  tenantPhone: '081-234-5678',
  room: 'Room 101',
  building: 'Block A · Floor 1',
  periodStart: '2026-03-01',
  periodEnd: '2026-03-31',
  dueDate: '2026-04-07',
  baseRent: 650,
  billDays: 31,
  daysInMonth: 31,
  waterPrev: 1268, waterCurrent: 1298, waterRate: 0.28,
  elecPrev: 3920,  elecCurrent: 3998,  elecRate: 0.12,
  fixedServices: [
    { name: 'Parking', amount: 50 },
    { name: 'WiFi',    amount: 30 },
  ],
  securityDeposit: 1300,
  total: 747.76,
}

// ── Invoice Preview Modal ─────────────────────────────────────────────────────
function PreviewModal({ open, onClose, settings, exchangeRate }) {
  if (!open) return null
  const { header, body, footer, qr } = settings
  const inv = SAMPLE_INV

  const waterUsage = inv.waterCurrent - inv.waterPrev
  const elecUsage  = inv.elecCurrent  - inv.elecPrev
  const waterAmt   = waterUsage * inv.waterRate
  const elecAmt    = elecUsage  * inv.elecRate
  const rentAmt    = inv.baseRent * (inv.billDays / inv.daysInMonth)

  const fmtDate = d => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  // Invoice number preview
  const digits = body.invoiceNoDigits === 4 ? '0001' : '000001'
  const dateStr = new Date(inv.periodStart)
    .toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    .replace(/\//g, '')
  const invoiceNo = `INV-${dateStr}-${digits}`

  const rate = exchangeRate || 4000

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-[#F6F6F6] w-full rounded-t-2xl max-h-[92vh] overflow-y-auto scrollbar-hide"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="sticky top-0 bg-white border-b border-[#E3E5EA] px-5 py-3.5 flex items-center justify-between z-10">
          <span className="text-[15px] font-bold text-[#1F1F1F]">Invoice Preview</span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full border border-[#E3E5EA] bg-[#F6F6F6] flex items-center justify-center text-[#707070]"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-4">
          {/* Paper invoice */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

            {/* ── HEADER ── */}
            {header.enabled && (
              <div className="px-5 pt-5 pb-4 border-b border-[#E3E5EA]">
                <div className="flex items-center gap-4">
                  {header.profileImage ? (
                    <img src={header.profileImage} alt="logo" className="w-14 h-14 rounded-full object-cover flex-shrink-0 border border-[#E3E5EA]" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-[#E8F0FF] flex items-center justify-center flex-shrink-0">
                      <FileText size={22} className="text-[#2563EB]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-bold text-[#1F1F1F] truncate">
                      {header.bizName || 'Your Business Name'}
                    </div>
                    {header.tinNo && (
                      <div className="text-[11px] text-[#707070] mt-0.5">TIN: {header.tinNo}</div>
                    )}
                    {header.bizPhone && (
                      <div className="text-[11px] text-[#707070]">{header.bizPhone}</div>
                    )}
                    {header.address && (
                      <div className="text-[11px] text-[#707070] leading-snug mt-0.5">{header.address}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── INVOICE TITLE + INFO ── */}
            <div className="px-5 pt-4 pb-3">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-[18px] font-bold text-[#1F1F1F]">INVOICE</div>
                  {body.enabled && (
                    <div className="text-[11px] text-[#707070] font-mono mt-0.5">{invoiceNo}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-[#707070]">Due Date</div>
                  <div className="text-[13px] font-bold text-[#2563EB]">{fmtDate(inv.dueDate)}</div>
                </div>
              </div>

              {/* Tenant / Room info */}
              <div className="bg-[#F6F6F6] rounded-xl px-4 py-3 space-y-1.5 text-[12px]">
                {[
                  { label: 'Tenant',      value: inv.tenantName },
                  { label: 'Phone',       value: inv.tenantPhone },
                  { label: 'Room',        value: `${inv.room} · ${inv.building}` },
                  { label: 'Period',      value: `${fmtDate(inv.periodStart)} – ${fmtDate(inv.periodEnd)}` },
                ].map(row => (
                  <div key={row.label} className="flex justify-between gap-2">
                    <span className="text-[#707070]">{row.label}</span>
                    <span className="font-semibold text-[#1F1F1F] text-right max-w-[55%]">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── LINE ITEMS ── */}
            <div className="px-5 pb-4">
              <div className="text-[10px] font-bold text-[#707070] uppercase tracking-wider mb-2">Line Items</div>
              <div className="border-t border-[#E3E5EA]">
                {[
                  {
                    label: 'Base Rent',
                    detail: inv.billDays === inv.daysInMonth
                      ? `${inv.billDays} days (full month)`
                      : `${inv.billDays}/${inv.daysInMonth} days (prorated)`,
                    amount: formatUSD(rentAmt),
                  },
                  {
                    label: 'Water',
                    detail: `${inv.waterPrev} → ${inv.waterCurrent} (${waterUsage} m³ × $${inv.waterRate})`,
                    amount: formatUSD(waterAmt),
                  },
                  {
                    label: 'Electricity',
                    detail: `${inv.elecPrev} → ${inv.elecCurrent} (${elecUsage} kWh × $${inv.elecRate})`,
                    amount: formatUSD(elecAmt),
                  },
                  ...inv.fixedServices.map(s => ({
                    label: s.name,
                    detail: 'Fixed / month',
                    amount: formatUSD(s.amount),
                  })),
                ].map((row, i) => (
                  <div key={i} className="flex items-start justify-between py-2.5 border-b border-[#F0F0F0]">
                    <div className="flex-1 min-w-0 mr-3">
                      <div className="text-[12px] font-semibold text-[#1F1F1F]">{row.label}</div>
                      <div className="text-[10px] text-[#707070] mt-0.5">{row.detail}</div>
                    </div>
                    <div className="text-[12px] font-bold text-[#1F1F1F] flex-shrink-0">{row.amount}</div>
                  </div>
                ))}
              </div>

              {/* Total block */}
              <div className="mt-2 space-y-1.5">
                <div className="flex justify-between text-[12px]">
                  <span className="text-[#707070]">Subtotal</span>
                  <span className="font-semibold">{formatUSD(inv.total)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#707070]">Security Deposit (ref.)</span>
                  <span className="text-[#707070]">{formatUSD(inv.securityDeposit)}</span>
                </div>
              </div>

              <div className="bg-[#E8F0FF] rounded-xl px-4 py-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-[14px] font-bold text-[#1F1F1F]">Total Due</span>
                  <span className="text-[17px] font-bold text-[#2563EB]">{formatUSD(inv.total)}</span>
                </div>
                {body.enabled && (
                  <div className="text-[10px] text-[#707070] text-right mt-0.5">
                    ≈ {formatKHR(inv.total, rate)} @ {rate.toLocaleString()} ៛/$
                  </div>
                )}
              </div>
            </div>

            {/* ── QR ── */}
            {qr.enabled && (
              <div className="px-5 pb-5 flex flex-col items-center border-t border-[#E3E5EA] pt-4">
                {qr.qrImage ? (
                  <img src={qr.qrImage} alt="QR" className="w-28 h-28 object-contain rounded-xl border border-[#E3E5EA]" />
                ) : (
                  <div className="w-28 h-28 bg-[#F6F6F6] rounded-xl flex flex-col items-center justify-center gap-1 border border-dashed border-[#D1D5DB]">
                    <QrCode size={36} className="text-[#B0B0B0]" strokeWidth={1.5} />
                    <span className="text-[10px] text-[#B0B0B0]">No QR uploaded</span>
                  </div>
                )}
                <div className="text-[11px] text-[#707070] mt-2">Scan to pay</div>
              </div>
            )}

            {/* ── FOOTER ── */}
            {footer.enabled && (
              <div className="border-t border-[#E3E5EA] px-5 py-4">
                <p className="text-[11px] text-[#707070] text-center leading-relaxed">
                  {footer.note || 'Thank you for your payment. Please contact us for any inquiries.'}
                </p>
              </div>
            )}
          </div>

          <div className="mt-3 text-center text-[11px] text-[#B0B0B0]">
            This is a preview using sample data
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InvoiceSetup() {
  const { invoiceSettings, updateInvoiceSettings, exchangeRate, updateExchangeRate } = useStore()
  const { header, body, footer, qr } = invoiceSettings
  const [previewOpen, setPreviewOpen] = useState(false)

  function h(data) { updateInvoiceSettings('header', data) }
  function b(data) { updateInvoiceSettings('body', data) }
  function f(data) { updateInvoiceSettings('footer', data) }
  function q(data) { updateInvoiceSettings('qr', data) }

  return (
    <div className="app-shell">
      <PageHeader
        title="Invoice Setup"
        rightSlot={
          <button
            onClick={() => setPreviewOpen(true)}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-[#2563EB]"
          >
            <Eye size={16} /> Preview
          </button>
        }
      />

      <div className="page-content scrollbar-hide p-4 space-y-3" style={{ paddingBottom: '32px' }}>

        {/* ── Invoice Header ── */}
        <SectionCard
          icon={FileText}
          iconBg="bg-[#E8F0FF]"
          iconColor="text-[#1E40AF]"
          title="Invoice Header"
          enabled={header.enabled}
          onToggle={v => h({ enabled: v })}
        >
          <ImageUploader
            label="Profile / Logo Image"
            value={header.profileImage}
            onChange={v => h({ profileImage: v })}
            circular
          />
          <Field label="Business Name" value={header.bizName} onChange={v => h({ bizName: v })} placeholder="e.g. ABC Property Co., Ltd." />
          <Field label="TIN No." value={header.tinNo} onChange={v => h({ tinNo: v })} placeholder="e.g. 12345678" />
          <Field label="Address" value={header.address} onChange={v => h({ address: v })} placeholder="e.g. 123 Main St, Phnom Penh" textarea />
          <Field label="Business Phone" value={header.bizPhone} onChange={v => h({ bizPhone: v })} placeholder="e.g. 023-456-789" type="tel" />
        </SectionCard>

        {/* ── Invoice Body ── */}
        <SectionCard
          icon={Hash}
          iconBg="bg-[#FFF3DF]"
          iconColor="text-[#8A6408]"
          title="Invoice Body"
          enabled={body.enabled}
          onToggle={v => b({ enabled: v })}
        >
          <div>
            <label className="text-[11px] font-semibold text-[#707070] uppercase tracking-[0.4px] mb-2 block">
              Invoice No. Format · prefix + date (DDMMYYYY) +
            </label>
            <div className="flex gap-2">
              {[4, 6].map(d => (
                <button
                  key={d}
                  onClick={() => b({ invoiceNoDigits: d })}
                  className={`flex-1 py-2 rounded-lg border-[1.5px] text-[13px] font-semibold transition-colors ${
                    body.invoiceNoDigits === d
                      ? 'border-[#2563EB] bg-[#E8F0FF] text-[#2563EB]'
                      : 'border-[#E3E5EA] bg-white text-[#707070]'
                  }`}
                >
                  {d}-digit
                </button>
              ))}
            </div>
            <div className="mt-1.5 text-[11px] text-[#707070]">
              Preview: <span className="font-bold text-[#1F1F1F]">
                INV-{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '')}-{body.invoiceNoDigits === 4 ? '0001' : '000001'}
              </span>
            </div>
          </div>

          <Field
            label="Exchange Rate (KHR per 1 USD)"
            value={String(exchangeRate)}
            onChange={v => { const n = parseFloat(v); if (n > 0) updateExchangeRate(n) }}
            placeholder="e.g. 4100"
            type="number"
          />
        </SectionCard>

        {/* ── Invoice Footer ── */}
        <SectionCard
          icon={AlignLeft}
          iconBg="bg-[#E8F6EF]"
          iconColor="text-[#1F6F4E]"
          title="Invoice Footer"
          enabled={footer.enabled}
          onToggle={v => f({ enabled: v })}
        >
          <Field
            label="Footer Note"
            value={footer.note}
            onChange={v => f({ note: v })}
            placeholder="e.g. Thank you for your payment. Please contact us for any inquiries."
            textarea
          />
        </SectionCard>

        {/* ── Invoice QR ── */}
        <SectionCard
          icon={QrCode}
          iconBg="bg-[#F3EEFF]"
          iconColor="text-[#6B3FA0]"
          title="Invoice QR"
          enabled={qr.enabled}
          onToggle={v => q({ enabled: v })}
        >
          <ImageUploader
            label="QR Code Image"
            value={qr.qrImage}
            onChange={v => q({ qrImage: v })}
          />
          <p className="text-[11px] text-[#707070]">
            This QR image will be shown on unpaid invoices for payment scanning.
          </p>
        </SectionCard>

      </div>

      <PreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        settings={invoiceSettings}
        exchangeRate={exchangeRate}
      />
    </div>
  )
}
