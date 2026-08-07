import { useState, useEffect, useRef } from 'react'
import { Globe, ChevronDown, Search, Check } from 'lucide-react'

const LANGUAGES = [
  { name: 'Arabic', code: 'ar' },
  { name: 'Bulgarian', code: 'bg' },
  { name: 'Croatian', code: 'hr' },
  { name: 'Czech', code: 'cs' },
  { name: 'Danish', code: 'da' },
  { name: 'Dutch', code: 'nl' },
  { name: 'English', code: 'en' },
  { name: 'Estonian', code: 'et' },
  { name: 'Finnish', code: 'fi' },
  { name: 'French', code: 'fr' },
  { name: 'German', code: 'de' },
  { name: 'Greek', code: 'el' },
  { name: 'Hindi', code: 'hi' },
  { name: 'Hungarian', code: 'hu' },
  { name: 'Indonesian', code: 'id' },
  { name: 'Italian', code: 'it' },
  { name: 'Japanese', code: 'ja' },
  { name: 'Korean', code: 'ko' },
  { name: 'Latvian', code: 'lv' },
  { name: 'Lithuanian', code: 'lt' },
  { name: 'Norwegian', code: 'no' },
  { name: 'Polish', code: 'pl' },
  { name: 'Portuguese - Brazilian', code: 'pt-BR' },
  { name: 'Portuguese - European', code: 'pt-PT' },
  { name: 'Romanian', code: 'ro' },
  { name: 'Russian', code: 'ru' },
  { name: 'Slovak', code: 'sk' },
  { name: 'Slovenian', code: 'sl' },
  { name: 'Spanish - European', code: 'es-ES' },
  { name: 'Spanish - Latin American', code: 'es-US' },
  { name: 'Swedish', code: 'sv' },
  { name: 'Thai', code: 'th' },
  { name: 'Turkish', code: 'tr' },
  { name: 'Ukrainian', code: 'uk' },
  { name: 'Vietnamese', code: 'vi' },
  { name: 'Chinese - Simplified', code: 'zh-CN' },
  { name: 'Chinese - Traditional', code: 'zh-TW' }
]

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLang, setSelectedLang] = useState(() => {
    const saved = localStorage.getItem('selectedLanguage')
    return saved ? JSON.parse(saved) : { name: 'English', code: 'en' }
  })
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredLanguages = LANGUAGES.filter(lang =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelect = (lang) => {
    setSelectedLang(lang)
    localStorage.setItem('selectedLanguage', JSON.stringify(lang))
    setIsOpen(false)
    setSearchQuery('')
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Dropdown Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white/80 hover:bg-zinc-50 border border-zinc-200 text-zinc-700 hover:text-zinc-900 rounded-full shadow-sm hover:shadow transition-all duration-200 font-medium text-xs md:text-sm cursor-pointer"
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-zinc-500" />
        <span className="truncate max-w-[120px] md:max-w-none">
          {selectedLang.name}
        </span>
        <span className="text-[10px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded font-mono uppercase">
          {selectedLang.code}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl bg-white border border-zinc-200/80 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] focus:outline-none z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* Search Box */}
          <div className="p-2 border-b border-zinc-100 flex items-center gap-1.5 bg-zinc-50/50">
            <Search className="w-3.5 h-3.5 text-zinc-400 ml-1.5" />
            <input
              type="text"
              placeholder="Search language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-0 p-1 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-0"
              autoFocus
            />
          </div>

          {/* Languages List */}
          <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => {
                const isSelected = lang.code === selectedLang.code
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleSelect(lang)}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-50 text-zinc-900 font-semibold'
                        : 'text-zinc-600 hover:bg-zinc-50/80 hover:text-zinc-900'
                    }`}
                    type="button"
                  >
                    <span className="flex items-center gap-2">
                      <span>{lang.name}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">({lang.code})</span>
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-zinc-900" />}
                  </button>
                )
              })
            ) : (
              <div className="px-3 py-4 text-xs text-zinc-400 text-center">
                No languages found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
