'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function SearchInput() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')

  // Sync state with URL only on mount or URL change
  useEffect(() => {
    const q = searchParams?.get('q') || ''
    setQuery(q)
  }, [searchParams])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        document.getElementById('global-search-input')?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSearch = (val: string) => {
    setQuery(val)
    if (val.trim()) {
      router.push(`/timeline?q=${encodeURIComponent(val)}`)
    } else {
      router.push('/timeline')
    }
  }

  return (
    <>
      <div className="relative group">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <span className="text-white/40 text-sm group-focus-within:text-accent transition-colors">🔍</span>
        </div>
        <input
          id="global-search-input"
          type="text"
          placeholder="Filter timeline..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full bg-[#0f1117] border border-white/10 rounded-xl py-2.5 pl-10 pr-12 text-sm text-white placeholder:text-white/30 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all font-medium"
        />
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <kbd className="hidden sm:inline-block border border-white/10 rounded px-1.5 py-[1px] text-[9px] bg-white/5 text-white/40 font-mono">
            ⌘K
          </kbd>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-white/5 border border-white/5 rounded-2xl relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-accent/20 blur-2xl rounded-full" />
        <h4 className="text-xs font-semibold text-white/70 mb-2 relative z-10 flex items-center gap-2">
          <span>⚡</span> Timeline Search
        </h4>
        <p className="text-[10px] text-white/40 leading-relaxed relative z-10">
          Type any entity like <strong>GPT-4</strong> or <strong>Anthropic</strong> to instantly assemble a fully cited historical timeline.
        </p>
      </div>
    </>
  )
}

export default function SearchColumn() {
  return (
    <div className="w-72 shrink-0 border-l border-white/[0.06] bg-[#080b12] px-5 py-6 fixed right-0 top-0 h-screen overflow-y-auto hidden lg:block z-20">
      <p className="text-[10px] font-semibold text-white/20 uppercase tracking-widest mb-4">
        Search Archive
      </p>
      <Suspense fallback={<div className="text-xs text-white/30">Loading search...</div>}>
        <SearchInput />
      </Suspense>
    </div>
  )
}
