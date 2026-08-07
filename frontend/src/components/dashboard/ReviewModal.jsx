import { useState } from 'react'
import { X, Calendar, AlertCircle, Trash2 } from 'lucide-react'

export default function ReviewModal({ memory, onClose, onSave, onDelete }) {
  if (!memory) return null

  // Calculate days remaining or default to 30
  const initialDate = memory.expiresAt ? new Date(memory.expiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  const today = new Date()
  const diffTime = initialDate.getTime() - today.getTime()
  const initialDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))

  const [days, setDays] = useState(initialDays)
  const [autoDelete, setAutoDelete] = useState(memory.autoDelete !== false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    const newExpiresAt = new Date()
    newExpiresAt.setDate(newExpiresAt.getDate() + parseInt(days, 10))
    await onSave(memory._id, { expiresAt: newExpiresAt, autoDelete })
    setIsSaving(false)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    await onDelete(memory._id)
    setIsDeleting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
          <h2 className="text-lg font-semibold text-zinc-900">Review Memory Retention</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Memory Preview */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 bg-white px-2 py-1 rounded shadow-sm border border-zinc-200">
                {memory.category}
              </span>
              <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded shadow-sm ${
                memory.sensitivity === 'high' || memory.sensitivity === 'critical' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                memory.sensitivity === 'medium' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                'bg-emerald-100 text-emerald-700 border border-emerald-200'
              }`}>
                {memory.sensitivity} Risk
              </span>
            </div>
            <p className="text-sm text-zinc-800 leading-relaxed font-medium">"{memory.content}"</p>
          </div>

          {/* Retention Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-900">
                <Calendar className="w-4 h-4 text-zinc-500" />
                Auto-Delete Timer
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={autoDelete}
                  onChange={(e) => setAutoDelete(e.target.checked)}
                />
                <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            {autoDelete ? (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Days to keep this memory</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" 
                    min="1" 
                    max="90" 
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="w-16 text-center text-sm font-bold text-zinc-700 bg-zinc-100 py-1.5 rounded-md border border-zinc-200">
                    {days} <span className="text-[10px] font-medium text-zinc-500">d</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 bg-blue-50 text-blue-800 p-3 rounded-lg text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-200">
                <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p>This memory will be kept indefinitely until you manually revoke it.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
          <button 
            onClick={handleDelete}
            disabled={isDeleting || isSaving}
            className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete Now
          </button>
          
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              disabled={isDeleting || isSaving}
              className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isDeleting || isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : 'Save Changes'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
