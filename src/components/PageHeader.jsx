import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export default function PageHeader({ title, subtitle, onBack, action }) {
  const navigate = useNavigate()

  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-start gap-3">
        {onBack !== false && (
          <button
            onClick={() => (onBack ? onBack() : navigate(-1))}
            className="mt-1 w-9 h-9 flex items-center justify-center rounded-full border border-trust-100 bg-white text-trust-600 hover:bg-trust-50 shrink-0"
            aria-label="Go back"
          >
            <ChevronLeft size={18} />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold leading-tight">{title}</h1>
          {subtitle && <p className="text-trust-400 mt-1">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}
