/**
 * Button component
 * variant: 'primary' | 'outline' | 'danger' | 'ghost'
 * size: 'md' | 'sm'
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled = false,
  fullWidth = true,
  ...props
}) {
  const base = 'flex items-center justify-center gap-1.5 font-semibold rounded-[10px] cursor-pointer transition-opacity active:opacity-80 select-none border-0'

  const sizes = {
    md: 'px-4 py-3 text-[15px]',
    sm: 'px-3.5 py-2 text-[13px]',
  }

  const variants = {
    primary: 'bg-[#2563EB] text-white hover:bg-[#1E4FD8] disabled:bg-[#B0B0B0]',
    outline: 'bg-white text-[#2563EB] border border-[#2563EB] hover:bg-[#E8F0FF]',
    danger:  'bg-[#FFEDEA] text-[#B12A1B]',
    ghost:   'bg-transparent text-[#707070]',
  }

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
