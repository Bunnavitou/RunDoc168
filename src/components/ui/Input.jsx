/**
 * Labeled input group
 */
export default function Input({
  label,
  error,
  className = '',
  inputClassName = '',
  ...props
}) {
  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label className="block text-[13px] font-semibold text-[#707070] mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`input-base ${error ? 'border-[#B12A1B]' : ''} ${inputClassName}`}
        {...props}
      />
      {error && (
        <p className="text-[12px] text-[#B12A1B] mt-1">{error}</p>
      )}
    </div>
  )
}

/** Labeled select input */
export function Select({ label, error, className = '', children, ...props }) {
  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label className="block text-[13px] font-semibold text-[#707070] mb-1.5">
          {label}
        </label>
      )}
      <select
        className={`input-base appearance-none ${error ? 'border-[#B12A1B]' : ''}`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-[12px] text-[#B12A1B] mt-1">{error}</p>
      )}
    </div>
  )
}

/** Labeled textarea */
export function Textarea({ label, error, className = '', rows = 3, ...props }) {
  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label className="block text-[13px] font-semibold text-[#707070] mb-1.5">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={`input-base resize-none ${error ? 'border-[#B12A1B]' : ''}`}
        {...props}
      />
      {error && (
        <p className="text-[12px] text-[#B12A1B] mt-1">{error}</p>
      )}
    </div>
  )
}
