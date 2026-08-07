import { ArrowLeft, ShieldAlert, FileType, Hourglass, Lock, Trash2, Fingerprint, ShieldOff } from 'lucide-react'

export function PrivacyAssessmentModal({ memory, onClose }) {
  if (!memory) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm transition-all duration-300">
      
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out border-l border-zinc-200">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-zinc-100">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-xs font-semibold tracking-wider text-zinc-500 hover:text-zinc-900 uppercase transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Timeline
          </button>
          
          <h2 className="text-3xl font-semibold text-zinc-900 tracking-tight">Privacy & Sensitivity Assessment</h2>
          <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
            Detailed analysis of stored memory node <span className="bg-zinc-100 px-1.5 py-0.5 rounded font-mono text-xs">{memory.id}</span>. Review classification and manage retention policies.
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-10 font-body-base">
          
          {/* Raw Extract Box */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-semibold text-zinc-400 tracking-widest uppercase">Raw Memory Extract</h3>
              <span className="text-[10px] font-mono text-zinc-400">{memory.timestamp} UTC</span>
            </div>
            <div className="bg-zinc-50/80 border border-zinc-100 rounded-xl p-6 shadow-inner">
              <p className="text-lg text-zinc-800 leading-relaxed font-medium">
                "My emergency contact is my partner, Alex. Their number is <span className="bg-red-100/50 text-red-700 px-1.5 py-0.5 rounded font-mono">555-019-8372</span>."
              </p>
            </div>
          </div>

          {/* Data Nutrition Label */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 tracking-widest uppercase mb-3">Data Nutrition Label</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Box 1 */}
              <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-rose-700 mb-2 tracking-wide">
                  <ShieldAlert className="w-3.5 h-3.5" /> Sensitivity
                </div>
                <div className="text-lg font-semibold text-rose-700">High / PII</div>
              </div>

              {/* Box 2 */}
              <div className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-zinc-500 mb-2 tracking-wide">
                  <FileType className="w-3.5 h-3.5" /> Data Type
                </div>
                <div className="text-lg font-medium text-zinc-900">Contact<br/>Info</div>
              </div>

              {/* Box 3 */}
              <div className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-zinc-500 mb-2 tracking-wide">
                  <Hourglass className="w-3.5 h-3.5" /> Storage Duration
                </div>
                <div className="text-lg font-medium text-zinc-900">Indefinite</div>
              </div>

              {/* Box 4 */}
              <div className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-zinc-500 mb-2 tracking-wide">
                  <Lock className="w-3.5 h-3.5" /> Access Scope
                </div>
                <div className="text-lg font-medium text-zinc-900">LLM<br/>Internal</div>
              </div>
            </div>
          </div>

          {/* Risk Assessment Warning */}
          <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-rose-400"></div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <h4 className="text-xs font-bold uppercase text-rose-700 tracking-wider">Risk Assessment: High</h4>
            </div>
            <p className="text-sm text-rose-800/80 leading-relaxed">
              This memory node contains direct Personally Identifiable Information (PII), specifically a standard-format telephone number associated with a named individual ("Alex"). Storing explicit contact information elevates the risk profile for targeted exposure. It is recommended to apply zero-knowledge encryption or anonymization if this data is not critical for immediate contextual recall.
            </p>
          </div>

        </div>

        {/* Bottom Action Bar */}
        <div className="px-8 py-6 border-t border-zinc-100 bg-white flex flex-col sm:flex-row gap-4 items-center">
          <button 
            onClick={onClose}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-rose-200 text-rose-600 font-semibold rounded-lg hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Purge Now
          </button>
          
          <button className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-zinc-200 text-zinc-600 font-medium rounded-lg hover:bg-zinc-50 transition-colors bg-white shadow-sm">
            <Fingerprint className="w-4 h-4" /> Anonymize
          </button>
          
          <button className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-zinc-200 text-zinc-600 font-medium rounded-lg hover:bg-zinc-50 transition-colors bg-white shadow-sm">
            <ShieldOff className="w-4 h-4" /> Restrict Access
          </button>
        </div>

      </div>
    </div>
  )
}
