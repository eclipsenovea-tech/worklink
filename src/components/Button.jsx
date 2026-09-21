const variants = {
  // Main action: deep navy
  primary:
    'bg-trust-700 text-white shadow-[0_8px_18px_-8px_rgba(23,58,94,0.65)] hover:bg-trust-800 active:bg-trust-900',
  // Secondary action: soft green tint
  secondary: 'bg-growth-100/70 text-growth-600 border border-growth-200 hover:bg-growth-100',
  // Positive action (claim, confirm): solid green
  growth:
    'bg-growth-500 text-white shadow-[0_8px_18px_-8px_rgba(46,154,97,0.7)] hover:bg-growth-600',
  // Quiet action: soft blue tint
  soft: 'bg-trust-50 text-trust-700 border border-trust-100 hover:bg-trust-100',
  ghost: 'bg-transparent text-trust-700 hover:bg-white/60',
  // Careful action (log out): soft amber tint
  danger: 'bg-amber-500/10 text-[#9A5212] border border-amber-500/30 hover:bg-amber-500/20',
  custom: ''
}

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  full = false,
  className = '',
  children,
  ...props
}) {
  const sizes = {
    sm: 'text-sm px-4 py-2',
    md: 'text-base px-5 py-3',
    lg: 'text-base px-6 py-4'
  }

  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${full ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}
