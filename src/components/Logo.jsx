const LOGO_SRC = '/Worklink_tagline.svg'
const ICON_SRC = '/Worklink_logo.svg'

const fit = (size) => ({ height: size, width: 'auto', maxWidth: '100%', objectFit: 'contain' })

export function Mark({ size = 180, className = '' }) {
  return <img src={ICON_SRC} alt="WorkLink" className={`shrink-0 ${className}`} style={fit(size)} />
}

export default function Logo({ size = 280, align = 'center', withTagline = false, className = '' }) {
  return (
    <div className={`flex flex-col ${align === 'start' ? 'items-start' : 'items-center'} ${className}`}>
      <img src={LOGO_SRC} alt="WorkLink" className="shrink-0" style={fit(size)} />
      {withTagline && (
        <p className="font-display font-semibold text-trust-700 text-lg tracking-wide text-center mt-4">
          Where Opportunities Meet People
        </p>
      )}
    </div>
  )
}
