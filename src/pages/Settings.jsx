import PageHeader from '../components/layout/PageHeader'
import { useStore } from '../store'
import { translations } from '../lib/i18n'

const CURRENCIES = [
  { code: 'USD', symbol: '$',  label: 'US Dollar'         },
  { code: 'KHR', symbol: '៛', label: 'Cambodian Riel'    },
  { code: 'KRW', symbol: '₩', label: 'Korean Won'        },
  { code: 'THB', symbol: '฿', label: 'Thai Baht'         },
  { code: 'EUR', symbol: '€', label: 'Euro'              },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen'      },
  { code: 'SGD', symbol: 'S$',label: 'Singapore Dollar'  },
  { code: 'CNY', symbol: '¥', label: 'Chinese Yuan'      },
]

export default function Settings() {
  const { language, currency, setCurrency } = useStore()
  const t = (key) => translations[language]?.[key] ?? translations.en[key] ?? key

  return (
    <div className="app-shell">
      <PageHeader title={t('settingsTitle')} />

      <div className="page-content scrollbar-hide p-4" style={{ paddingBottom: '32px' }}>

        {/* Currency */}
        <div className="bg-white rounded-xl border border-[#E3E5EA] overflow-hidden">
          <div className="px-4 pt-4 pb-3">
            <div className="text-[13px] font-bold text-[#707070] uppercase tracking-wide">{t('currency')}</div>
            <div className="text-[12px] text-[#B0B0B0] mt-0.5">{t('currencySub')}</div>
          </div>
          <div className="px-4 pb-4 grid grid-cols-2 gap-2">
            {CURRENCIES.map(({ code, symbol, label }) => (
              <button
                key={code}
                onClick={() => setCurrency(code)}
                className={`rounded-xl border-2 px-3 py-3 flex items-center gap-2.5 transition-all active:opacity-80 text-left ${
                  currency === code
                    ? 'border-[#1E3A8A] bg-[#EAF0FF]'
                    : 'border-[#E3E5EA] bg-[#F9FAFB]'
                }`}
              >
                <span className={`text-[18px] font-bold w-8 text-center flex-shrink-0 ${currency === code ? 'text-[#1E3A8A]' : 'text-[#1F1F1F]'}`}>
                  {symbol}
                </span>
                <div className="min-w-0">
                  <div className={`text-[13px] font-bold ${currency === code ? 'text-[#1E3A8A]' : 'text-[#1F1F1F]'}`}>{code}</div>
                  <div className="text-[10px] text-[#707070] truncate">{label}</div>
                </div>
                {currency === code && (
                  <div className="ml-auto w-4 h-4 rounded-full bg-[#1E3A8A] flex items-center justify-center flex-shrink-0">
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>


      </div>
    </div>
  )
}
