'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format, parseISO } from 'date-fns'

interface SearchResult {
  date: string
  title: string
  summary: string
  url: string
  source: string
}

function SearchTimeline({ query }: { query: string }) {
  const [data, setData] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/search-index.json')
      .then(res => res.json())
      .then(json => {
        setData(json || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="mt-8 text-xs text-white/30 text-center animate-pulse">Loading index...</div>
  
  if (!query.trim()) {
    return (
      <div className="mt-8 p-4 bg-white/5 border border-white/5 rounded-2xl relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-accent/20 blur-2xl rounded-full" />
        <h4 className="text-xs font-semibold text-white/70 mb-2 relative z-10 flex items-center gap-2">
          <span>⚡</span> Timeline Search
        </h4>
        <p className="text-[10px] text-white/40 leading-relaxed relative z-10">
          Type any entity like <strong>GPT-4</strong> or <strong>Anthropic</strong> to instantly assemble a fully cited historical timeline.
        </p>
      </div>
    )
  }

  const q = query.toLowerCase()
  const filtered = data.filter(item => 
    item.title.toLowerCase().includes(q) || 
    item.summary.toLowerCase().includes(q) ||
    item.source.toLowerCase().includes(q)
  )

  if (filtered.length === 0) {
    return <div className="mt-8 text-[11px] text-white/40 text-center bg-white/5 rounded-lg py-6 border border-white/5">No results found for "{query}"</div>
  }

  // Group by month
  const grouped: Record<string, SearchResult[]> = {}
  filtered.forEach(item => {
    try {
      const month = format(parseISO(item.date), 'MMM yyyy')
      if (!grouped[month]) grouped[month] = []
      grouped[month].push(item)
    } catch {}
  })

  return (
    <div className="mt-8 relative before:absolute before:inset-y-2 before:left-[7px] before:w-px before:bg-gradient-to-b before:from-accent/50 before:to-transparent">
      <div className="space-y-6">
        {Object.entries(grouped).map(([month, articles]) => (
          <div key={month} className="relative">
            <div className="relative z-10 flex items-center gap-3 mb-4">
              <div className="w-4 h-4 rounded-full bg-[#080b12] border-[3px] border-accent flex items-center justify-center -ml-[3px]" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-accent drop-shadow-[0_0_8px_rgba(167,139,250,0.5)]">{month}</span>
            </div>
            <div className="space-y-4 pl-6">
              {articles.map((article, i) => (
                <a key={i} href={article.url} target="_blank" rel="noopener noreferrer" className="block group bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] hover:border-accent/30 rounded-lg p-3 transition-all duration-300">
                  <div className="text-[9px] text-white/30 font-mono mb-1.5 flex items-center gap-2">
                    <span className="text-white/50">{format(parseISO(article.date), 'MMM d')}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="truncate">{article.source}</span>
                  </div>
                  <h4 className="text-[11px] font-medium leading-snug text-white/80 group-hover:text-white transition-colors line-clamp-2 mb-1">
                    {article.title}
                  </h4>
                  <p className="text-[10px] text-white/40 line-clamp-2 leading-relaxed hidden group-hover:block transition-all">
                    {article.summary}
                  </p>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SearchInput() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')

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
        router.replace(`?q=${encodeURIComponent(val)}`, { scroll: false })
    } else {
        router.replace(`?`, { scroll: false })
    }
  }

  return (
    <>
      <div className="relative group sticky top-0 z-20 bg-[#080b12] pb-4 pt-2">
        <div className="absolute inset-y-0 pb-2 left-3 flex items-center pointer-events-none">
          <span className="text-white/40 text-sm group-focus-within:text-accent transition-colors mt-2">🔍</span>
        </div>
        <input
          id="global-search-input"
          type="text"
          placeholder="Filter timeline..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full bg-[#0f1117] border border-white/10 rounded-xl py-2.5 pl-10 pr-12 text-sm text-white placeholder:text-white/30 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all font-medium shadow-[0_0_15px_rgba(0,0,0,0.5)]"
        />
        <div className="absolute inset-y-0 right-3 pb-2 flex items-center pointer-events-none">
          <kbd className="hidden sm:inline-block border border-white/10 rounded px-1.5 py-[1px] text-[9px] bg-white/5 text-white/40 font-mono mt-2">
            ⌘K
          </kbd>
        </div>
      </div>
      
      <SearchTimeline query={query} />
    </>
  )
}

export default function SearchColumn() {
  return (
    <div className="w-72 shrink-0 border-l border-white/[0.06] bg-[#080b12] px-5 py-6 fixed right-0 top-0 h-screen overflow-y-auto hidden lg:block z-20 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      <p className="text-[10px] font-semibold text-white/20 uppercase tracking-widest mb-2 sticky top-0 bg-[#080b12] z-20 pt-1 pb-2">
        Timeline Search
      </p>
      <Suspense fallback={<div className="text-xs text-white/30">Loading search...</div>}>
        <SearchInput />
      </Suspense>
    </div>
  )
}
