import { cn } from '../../lib/utils'

export function SensitivityBadge({ sensitivity, className }) {
  const normalized = (sensitivity || 'low').toLowerCase()
  
  const getBadgeClass = (level) => {
    switch(level) {
      case 'critical': return 'badge-forgotten' // Red
      case 'high': return 'bg-[rgba(249,115,22,0.12)] text-[#fb923c] border-[rgba(249,115,22,0.25)]' // Orange
      case 'medium': return 'badge-expired' // Amber
      case 'low':
      default: return 'badge-active' // Green
    }
  }

  const getDotClass = (level) => {
    switch(level) {
      case 'critical': return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
      case 'high': return 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]'
      case 'medium': return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
      case 'low':
      default: return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
    }
  }

  return (
    <span className={cn("badge border", getBadgeClass(normalized), className)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", getDotClass(normalized))} />
      {normalized.toUpperCase()}
    </span>
  )
}
