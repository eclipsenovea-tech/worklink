const tierStyles = {
  new: 'bg-cloud-100 text-trust-400 border-cloud-200',
  skilled: 'bg-teal-400/10 text-teal-500 border-teal-400/30',
  professional: 'bg-growth-50 text-growth-600 border-growth-200'
}

function tierFor(jobs) {
  if (jobs >= 100) return 'professional'
  if (jobs >= 20) return 'skilled'
  return 'new'
}

export default function SkillBadge({ category, jobs }) {
  const tier = tierFor(jobs)
  const label = tier === 'professional' ? 'Professional' : tier === 'skilled' ? 'Verified' : 'Starting out'

  return (
    <div className={`rounded-2xl border px-4 py-3 ${tierStyles[tier]}`}>
      <p className="font-semibold text-trust-700">{category}</p>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs">{jobs} jobs</span>
        <span className="text-[11px] font-medium">{label}</span>
      </div>
    </div>
  )
}
