import { useState } from 'react'
import { Leaf, Sparkles, Package, Baby, GraduationCap, Truck, Wrench, Briefcase } from 'lucide-react'

// Shown whenever a job has no photo yet (or its photo file can't be found).
// The icon + tint identify the category at a glance.
const categoryStyle = {
  Cleaning: { icon: Sparkles, tint: 'bg-teal-400/15 text-teal-500' },
  Gardening: { icon: Leaf, tint: 'bg-growth-100 text-growth-500' },
  Delivery: { icon: Package, tint: 'bg-amber-500/15 text-amber-600' },
  Childminding: { icon: Baby, tint: 'bg-trust-50 text-trust-400' },
  Tutoring: { icon: GraduationCap, tint: 'bg-trust-100 text-trust-500' },
  Moving: { icon: Truck, tint: 'bg-teal-400/15 text-teal-500' },
  Repairs: { icon: Wrench, tint: 'bg-amber-500/15 text-amber-600' }
}
const fallbackStyle = { icon: Briefcase, tint: 'bg-cloud-100 text-trust-300' }

/**
 * Job photo, or a category placeholder if there isn't one.
 * Size and rounding come from `className` so the same component works as a
 * small card thumbnail and a large hero image.
 */
export default function JobImage({ job, iconSize = 32, className = '' }) {
  const [failedSrc, setFailedSrc] = useState(null)
  const { icon: Icon, tint } = categoryStyle[job.category] ?? fallbackStyle

  if (job.image && failedSrc !== job.image) {
    return (
      <img
        src={job.image}
        alt={job.title}
        loading="lazy"
        onError={() => setFailedSrc(job.image)}
        className={`object-cover bg-cloud-100 ${className}`}
      />
    )
  }

  return (
    <div
      role="img"
      aria-label={`${job.category} task`}
      className={`flex items-center justify-center ${tint} ${className}`}
    >
      <Icon size={iconSize} strokeWidth={1.75} />
    </div>
  )
}
