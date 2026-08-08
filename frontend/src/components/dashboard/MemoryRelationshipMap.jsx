import React, { useState } from 'react'
import { Brain, Trash2, X, Activity, Sliders, Clock, User, BookOpen, FileText, Edit3, Timer } from 'lucide-react'

// The 6 Canonical Backend Categories
const CANONICAL_CATEGORIES = [
  'health',
  'preference',
  'habit',
  'personal',
  'education',
  'miscellaneous'
]

const categoryStyles = {
  health: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
    stroke: '#e11d48',
    fillIdle: '#ffe4e6',
    textIdle: '#9f1239',
    label: 'Health',
    Icon: Activity
  },
  preference: {
    bg: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    stroke: '#9333ea',
    fillIdle: '#f3e8ff',
    textIdle: '#6b21a8',
    label: 'Preference',
    Icon: Sliders
  },
  habit: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    stroke: '#d97706',
    fillIdle: '#fef3c7',
    textIdle: '#92400e',
    label: 'Habit',
    Icon: Clock
  },
  personal: {
    bg: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100',
    stroke: '#0284c7',
    fillIdle: '#e0f2fe',
    textIdle: '#075985',
    label: 'Personal',
    Icon: User
  },
  education: {
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
    stroke: '#4f46e5',
    fillIdle: '#e0e7ff',
    textIdle: '#3730a3',
    label: 'Education',
    Icon: BookOpen
  },
  miscellaneous: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    stroke: '#059669',
    fillIdle: '#d1fae5',
    textIdle: '#065f46',
    label: 'Miscellaneous',
    Icon: FileText
  }
}

// Helper to strictly normalize any input category into 1 of the 6 canonical categories
function normalizeCategory(rawCat) {
  if (!rawCat) return 'miscellaneous'
  const c = String(rawCat).toLowerCase().trim()
  if (c === 'health') return 'health'
  if (c === 'preference' || c === 'interest') return 'preference'
  if (c === 'habit') return 'habit'
  if (c === 'personal' || c === 'location' || c === 'identity') return 'personal'
  if (c === 'education' || c === 'goal') return 'education'
  return 'miscellaneous'
}

export default function MemoryRelationshipMap({ memories = [], onForgetMemory, onEditMemory, onUpdateRetention }) {
  const [selectedCategory, setSelectedCategory] = useState(null)
  
  // Edit Memory State
  const [editingMemory, setEditingMemory] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Retention Modal State
  const [retentionMemory, setRetentionMemory] = useState(null)
  const [retentionMonths, setRetentionMonths] = useState('')
  const [retentionDays, setRetentionDays] = useState('30')
  const [isSavingRetention, setIsSavingRetention] = useState(false)

  const openEdit = (mem) => {
    setEditingMemory(mem)
    setEditValue(mem.content)
  }

  const handleEditSave = async () => {
    if (!editValue.trim() || !editingMemory) return
    setIsSaving(true)
    try {
      await onEditMemory(editingMemory.id, editValue.trim())
      setEditingMemory(null)
    } catch (err) {
      console.error('Edit failed:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const openRetention = (mem) => {
    setRetentionMemory(mem)
    setRetentionMonths('')
    setRetentionDays('30') // default form state
  }

  const handleRetentionSave = async () => {
    if (!retentionMemory || !onUpdateRetention) return
    setIsSavingRetention(true)
    try {
      await onUpdateRetention(retentionMemory.id, {
        expiresInMonths: retentionMonths || 0,
        expiresInDays: retentionDays || 0,
        autoDelete: true
      })
      setRetentionMemory(null)
    } catch (err) {
      console.error('Retention update failed:', err)
    } finally {
      setIsSavingRetention(false)
    }
  }

  // Initialize categoriesMap with EXACTLY the 6 canonical backend categories
  const categoriesMap = {
    health: [],
    preference: [],
    habit: [],
    personal: [],
    education: [],
    miscellaneous: []
  }

  // Populate memories into their normalized category bucket
  memories.forEach((memory) => {
    const normKey = normalizeCategory(memory.category)
    categoriesMap[normKey].push(memory)
  })

  // Fixed canvas math for exactly 6 nodes
  const radius = 105
  const centerX = 160
  const centerY = 160

  const nodePositions = CANONICAL_CATEGORIES.map((catKey, idx) => {
    const angle = (idx / 6) * 2 * Math.PI - Math.PI / 2
    return {
      category: catKey,
      count: categoriesMap[catKey].length,
      memories: categoriesMap[catKey],
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      style: categoryStyles[catKey]
    }
  })

  // Filtered memory list
  const activeMemories = selectedCategory
    ? categoriesMap[selectedCategory] || []
    : memories

  const getSensitivityBadgeClass = (level) => {
    switch (level?.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'bg-rose-50 text-rose-700 border-rose-200 font-semibold'
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200 font-semibold'
      case 'low':
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold'
    }
  }

  const handleCategorySelect = (category) => {
    if (selectedCategory === category) {
      setSelectedCategory(null)
    } else {
      setSelectedCategory(category)
    }
  }

  const handleCenterNodeClick = () => {
    setSelectedCategory(null)
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm mb-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-900 tracking-tight">
              Memory Relationship Map
            </h2>
            <p className="text-xs text-zinc-500">
              Visualizing the 6 backend categories: Health, Preference, Habit, Personal, Education & Miscellaneous.
            </p>
          </div>
        </div>

        {/* Action / Reset Filter */}
        <div className="flex items-center gap-2">
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-xs font-medium text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filter</span>
            </button>
          )}
          <span className="text-xs font-mono bg-zinc-100 text-zinc-700 px-3 py-1.5 rounded-lg font-semibold border border-zinc-200">
            {memories.length} Total Memories
          </span>
        </div>
      </div>

      {/* Main Graph Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-zinc-50/50 border border-zinc-200/80 rounded-2xl p-6">
        
        {/* SVG Network Canvas (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center">
            <svg viewBox="0 0 320 320" className="w-full h-full select-none">
              {/* Connector Lines */}
              {nodePositions.map((node) => {
                const isSelected = selectedCategory === node.category
                return (
                  <line
                    key={`line-${node.category}`}
                    x1={centerX}
                    y1={centerY}
                    x2={node.x}
                    y2={node.y}
                    stroke={isSelected ? node.style.stroke : '#d4d4d8'}
                    strokeWidth={isSelected ? '3' : '1.5'}
                    strokeDasharray={isSelected ? 'none' : '4 4'}
                  />
                )
              })}

              {/* Central User Node */}
              <g
                className="cursor-pointer"
                onClick={handleCenterNodeClick}
                role="button"
                tabIndex={0}
                aria-label="Show all memories"
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    handleCenterNodeClick()
                  }
                }}
              >
                <circle
                  cx={centerX}
                  cy={centerY}
                  r="26"
                  className="fill-zinc-900 stroke-indigo-500 stroke-[3.5px] drop-shadow-md"
                />
                <text
                  x={centerX}
                  y={centerY + 4}
                  textAnchor="middle"
                  fill="white"
                  className="text-[10px] font-extrabold tracking-widest uppercase"
                >
                  YOUR
                </text>
              </g>

              {/* Category Nodes — Exactly 6 Unique Backend Categories */}
              {nodePositions.map((node) => {
                const isSelected = selectedCategory === node.category
                return (
                  <g
                    key={`node-${node.category}`}
                    onClick={() => handleCategorySelect(node.category)}
                    className="cursor-pointer"
                  >
                    {isSelected && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="25"
                        fill="none"
                        stroke={node.style.stroke}
                        strokeWidth="2.5"
                        strokeOpacity="0.4"
                      />
                    )}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isSelected ? '20' : '17'}
                      fill={isSelected ? node.style.stroke : node.style.fillIdle}
                      stroke={node.style.stroke}
                      strokeWidth="2.5"
                      className="shadow-sm transition-all"
                    />
                    <text
                      x={node.x}
                      y={node.y + 4}
                      textAnchor="middle"
                      fill={isSelected ? '#ffffff' : node.style.textIdle}
                      className="text-[12px] font-extrabold select-none"
                    >
                      {node.count}
                    </text>
                    <text
                      x={node.x}
                      y={node.y + 33}
                      textAnchor="middle"
                      fill={isSelected ? node.style.stroke : '#4b5563'}
                      className="text-[10px] uppercase font-extrabold tracking-wider select-none"
                    >
                      {node.style.label}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

          <p className="text-[11px] text-zinc-400 mt-2 font-medium text-center select-none">
            Click any category node to inspect and filter memories
          </p>
        </div>

        {/* Category Filter Chips & Memory Drawer (7 cols) */}
        <div className="lg:col-span-7 flex flex-col h-full justify-between">
          


          {/* Associated Memories List Container */}
          <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs min-h-[260px] flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100">
              <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-2">
                {selectedCategory ? (
                  <>
                    <span>{categoryStyles[selectedCategory]?.label} Category</span>
                  </>
                ) : (
                  <span>All Stored Memories</span>
                )}
                <span className="text-zinc-400 text-xs font-normal">
                  ({activeMemories.length} record{activeMemories.length === 1 ? '' : 's'})
                </span>
              </span>

              {selectedCategory && (
                <span className="text-[11px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  Filtered View
                </span>
              )}
            </div>

            {/* List Items */}
            <div className="space-y-2.5 max-h-[210px] overflow-y-auto pr-1 flex-1">
              {activeMemories.map((mem) => {
                const normKey = normalizeCategory(mem.category)
                const style = categoryStyles[normKey]
                const { Icon } = style
                return (
                  <div
                    key={mem.id}
                    className="p-3 bg-zinc-50/80 border border-zinc-200/80 rounded-lg flex items-start justify-between gap-3 hover:bg-zinc-100/80 transition-colors group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${style.bg}`}>
                          <Icon className="w-3 h-3" />
                          {style.label}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] border ${getSensitivityBadgeClass(
                            mem.sensitivity
                          )}`}
                        >
                          {mem.sensitivity} Risk
                        </span>
                      </div>
                      <p className="text-xs text-zinc-800 font-medium leading-relaxed mt-1">
                        {mem.content}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        title="Set Expiration Timer"
                        onClick={() => openRetention(mem)}
                        className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors flex items-center gap-1 text-xs"
                      >
                        <Timer className="w-3.5 h-3.5" />
                        <span className="hidden group-hover:inline font-medium">Timer</span>
                      </button>
                      <button
                        title="Edit memory"
                        onClick={() => openEdit(mem)}
                        className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 text-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span className="hidden group-hover:inline font-medium">Edit</span>
                      </button>
                      <button
                        onClick={() => onForgetMemory && onForgetMemory(mem.id)}
                        title="Forget memory"
                        className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden group-hover:inline font-medium">Forget</span>
                      </button>
                    </div>
                  </div>
                )
              })}

              {activeMemories.length === 0 && (
                <div className="py-12 text-center text-zinc-400 text-xs italic flex-1 flex items-center justify-center">
                  No memories stored under this category.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Edit Memory Modal */}
      {editingMemory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/60">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-500" />
                <span className="font-semibold text-zinc-900 text-sm">Edit Memory</span>
              </div>
              <button
                onClick={() => setEditingMemory(null)}
                className="p-1 rounded-lg hover:bg-zinc-200 transition-colors text-zinc-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Memory Content
              </label>
              <textarea
                className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-none min-h-[100px] transition-all"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                autoFocus
                placeholder="Update memory content..."
              />
              <p className="text-xs text-zinc-400 mt-2">This change will be saved to the database and logged in the Memory Timeline.</p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-100 bg-zinc-50/40">
              <button
                onClick={() => setEditingMemory(null)}
                className="px-4 py-2 text-sm font-medium text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={!editValue.trim() || isSaving}
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
              >
                {isSaving ? (
                  <><span className="inline-block w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin mr-1" />Saving...</>
                ) : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Retention Timer Modal */}
      {retentionMemory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-sm mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/60">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-amber-500" />
                <span className="font-semibold text-zinc-900 text-sm">Set Auto-Delete Timer</span>
              </div>
              <button
                onClick={() => setRetentionMemory(null)}
                className="p-1 rounded-lg hover:bg-zinc-200 transition-colors text-zinc-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-sm text-zinc-600 mb-4 leading-relaxed">
                Choose when this memory should be automatically deleted from the system.
              </p>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Months</label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    placeholder="0"
                    className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                    value={retentionMonths}
                    onChange={(e) => setRetentionMonths(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Days</label>
                  <input
                    type="number"
                    min="0"
                    max="365"
                    placeholder="30"
                    className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                    value={retentionDays}
                    onChange={(e) => setRetentionDays(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-100 bg-zinc-50/40">
              <button
                onClick={() => setRetentionMemory(null)}
                className="px-4 py-2 text-sm font-medium text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRetentionSave}
                disabled={isSavingRetention}
                className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2"
              >
                {isSavingRetention ? (
                  <><span className="inline-block w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin mr-1" />Saving...</>
                ) : 'Set Timer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
