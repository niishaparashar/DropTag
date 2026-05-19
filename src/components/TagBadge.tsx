import { Link } from 'react-router-dom'
import { normalizeTag } from '../utils/formatters'

interface TagBadgeProps {
  name: string
  count?: number
  className?: string
}

export default function TagBadge({ name, count, className = '' }: TagBadgeProps) {
  const normalized = normalizeTag(name)

  return (
    <Link
      to={`/tag/${normalized}`}
      className={`inline-flex min-h-8 items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm font-medium text-emerald-100 transition hover:border-emerald-300/50 hover:bg-emerald-400/20 ${className}`}
    >
      <span>#{normalized}</span>
      {typeof count === 'number' ? <span className="text-xs text-emerald-50/70">{count}</span> : null}
    </Link>
  )
}
