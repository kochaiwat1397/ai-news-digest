'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function SearchInput() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    const q = searchParams?.get('q') || ''
    setQuery(q)
  }, [searchParams])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        document.getElementById('header-search-input')?.focus()
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
    <div className={`relative flex items-center transition-all duration-300 ease-out hidden sm:flex ${isFocused ? 'w-64 md:w-80' : 'w-48 md:w-64'}`}>
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <span className={`text-[13px] transition-colors duration-300 ${isFocused ? 'text-accent' : 'text-white/40'}`}>🔍</span>
      </div>
      <input
        id="header-search-input"
        type="text"
        placeholder="Search archive..."
        value={query}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full bg-[#0f1117]/80 backdrop-blur-sm border border-white/10 rounded-full py-1.5 pl-9 pr-12 text-xs text-white placeholder:text-white/30 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all font-medium shadow-inner hover:bg-[#141928]"
      />
      <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
        <kbd className={`hidden sm:inline-block border rounded px-1.5 text-[9px] font-mono transition-colors duration-300 ${isFocused ? 'border-accent/30 bg-accent/10 text-accent' : 'border-white/10 bg-white/5 text-white/40'}`}>
          ⌘K
        </kbd>
      </div>
    </div>
  )
}

export default function SearchBar() {
  return (
    <Suspense fallback={<div className="hidden sm:block w-48 md:w-64 h-[30px] bg-white/5 animate-pulse rounded-full border border-white/5" />}>
      <SearchInput />
    </Suspense>
  )
}
