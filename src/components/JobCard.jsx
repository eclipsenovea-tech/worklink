import { Link } from 'react-router-dom'
import { MapPin, Clock } from 'lucide-react'
import JobImage from './JobImage.jsx'

export default function JobCard({ job }) {
  return (
    <Link
      to={`/app/task/${job.id}`}
      className="flex gap-3 sm:gap-4 bg-white rounded-2xl border border-trust-100/70 p-3 sm:p-4 shadow-card hover:border-trust-300 transition-colors"
    >
      <div className="shrink-0 w-20 sm:w-24">
        <JobImage job={job} iconSize={32} className="w-full aspect-square rounded-xl" />
        <div className="mt-2 text-center">
          <p className="font-display font-bold text-lg leading-none text-trust-700">R{job.pay}</p>
          <p className="text-xs text-trust-300 mt-1">fixed rate</p>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-growth-600 uppercase tracking-wide">{job.category}</p>
        <h3 className="font-display font-semibold text-base sm:text-lg leading-snug text-trust-700 mt-0.5">
          {job.title}
        </h3>
        <p className="text-sm text-trust-400 mt-1.5 line-clamp-2">{job.description}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-trust-400">
          <span className="flex items-center gap-1">
            <MapPin size={14} /> {job.distance} km away
          </span>
          <span className="flex items-center gap-1">
            <Clock size={14} /> {job.postedAt}
          </span>
        </div>
      </div>
    </Link>
  )
}
