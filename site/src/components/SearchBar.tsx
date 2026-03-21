'use client'
import { useState, useEffect, useRef } from 'react'

interface SearchResult {
  date: string
  title: string
  summary: string
  url: string
  source: string
}

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [allData, setAllData] = useState<SearchResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && allData.length === 0) {
      const basePath = process.env.NODE_ENV === 'production' ? '/ai-news-digest' : ''
      fetch(`${basePath}/search-index.json`)
        .then(res => res.json())
        .then(data => setAllData(data))
        .catch(err => console.error('Failed to load search index:', err))
    }
  }, [isOpen, allData.length])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    const q = query.toLowerCase()
    const filtered = allData.filter(item => 
      item.title.toLowerCase().includes(q) || 
      item.summary.toLowerCase().includes(q) ||
      item.source.toLowerCase().includes(q)
    ).slice(0, 8) // Limit to top 8 results
    setResults(filtered)
  }, [query, allData])

  // Keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/40 text-xs hover:bg-white/10 hover:text-white/70 transition-colors"
      >
        <span>🔍 Search...</span>
        <kbd className="hidden sm:inline-block border border-white/20 rounded px-1.5 py-[1px] text-[9px] bg-white/5 text-white/50 font-mono">
          ⌘K
        </kbd>
      </button>
    )
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-[#080b12]/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      <div className="fixed inset-x-4 top-[10%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[500px] z-50 bg-[#0f1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
        <div className="p-4 border-b border-light/5 flex items-center gap-3">
          <span className="text-white/40">🔍</span>
          <input
            ref={inputRef}
            autoFocus
            type="text"
            placeholder="Search global AI news archive..."
            className="w-full bg-transparent border-none outline-none text-white text-sm placeholder:text-white/30"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button onClick={() => setIsOpen(false)} className="text-[10px] text-white/40 hover:text-white px-2 py-1 rounded bg-white/5 uppercase font-medium">Esc</button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {!query && (
             <div className="p-6 text-center text-white/20 text-xs">
                Start typing to scan {allData.length} articles globally.
             </div>
          )}
          {query && results.length === 0 && (
            <div className="p-6 text-center text-white/40 text-sm">No results found for "{query}"</div>
          )}
          {results.map((item, i) => (
            <a 
              key={i} 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block p-3 hover:bg-white/5 rounded-xl transition-colors group"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center justify-between mb-1.5 text-[10px] text-white/30">
                <span className="font-mono bg-white/5 px-1.5 rounded text-white/40">{item.date}</span>
                <span className="px-1.5 py-[1px] bg-white/5 text-white/50 rounded border border-white/10 uppercase tracking-wide">{item.source}</span>
              </div>
              <h4 className="text-white/90 text-sm font-medium leading-snug mb-1 group-hover:text-accent-blue transition-colors line-clamp-1">{item.title}</h4>
              <p className="text-white/40 text-xs line-clamp-2">{item.summary}</p>
            </a>
          ))}
        </div>
      </div>
    </>
  )
}
