import { MemoryCard } from './MemoryCard'

export function MemoryList({ memories, onForget }) {
  if (memories.length === 0) {
    return (
      <div className="card border-dashed p-12 text-center">
        <p className="text-body text-[var(--text-muted)]">No active memories found.</p>
        <p className="text-sm mt-2 text-[var(--text-muted)]">Chat with MemCommit to generate some context.</p>
      </div>
    )
  }

  // Group by category (Phase 3 spec)
  const grouped = memories.reduce((acc, mem) => {
    const cat = mem.category || 'general'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(mem)
    return acc
  }, {})

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h3 className="text-meta uppercase text-[var(--text-secondary)] mb-3 pl-1 border-l-2 border-[var(--accent)]">
            {category} <span className="opacity-50 ml-1">({items.length})</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map(mem => (
              <MemoryCard key={mem._id} memory={mem} onForget={onForget} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
