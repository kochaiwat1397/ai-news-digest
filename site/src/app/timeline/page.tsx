import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import SearchBar from '@/components/SearchBar'
import SearchColumn from '@/components/SearchColumn'
import Link from 'next/link'
import TimelineContent from '@/components/TimelineContent'

interface SearchResult {
  date: string
  title: string
  summary: string
  url: string
  source: string
}

export default function TimelinePage() {
  const DIGESTS_DIR = join(process.cwd(), '..', 'digests')
  const files = (() => {
    try { return readdirSync(DIGESTS_DIR).filter(f => f.endsWith('.md')).sort().reverse() }
    catch { return [] }
  })()
  const dates = files.map(f => f.replace('.md', ''))
  
  const searchIndexPath = join(process.cwd(), 'public', 'search-index.json')
  let data: SearchResult[] = []
  try {
    data = JSON.parse(readFileSync(searchIndexPath, 'utf-8'))
  } catch (err) {
    console.error('Missing search index, please run build_search_index.js')
  }

  return (
    <div className="flex min-h-screen bg-[#080b12] text-white/90 selection:bg-accent/30 selection:text-white relative">
      <div className="fixed inset-0 bg-glow pointer-events-none" />

      <div className="flex-1 flex flex-col relative z-10 w-full ml-0 sm:ml-56 lg:mr-72">
        
        <header className="sticky top-0 z-40 bg-[#080b12]/80 backdrop-blur-xl border-b border-light/5">
          <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <span className="text-lg">⚡</span>
              <span className="font-semibold text-sm tracking-tight text-white">
                Anti-Gravity <span className="gradient-text">AI Digest</span>
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/timeline" className="text-[11px] font-medium text-white transition-colors underline decoration-accent decoration-2 underline-offset-4">
                Timeline
              </Link>
              <SearchBar />
              <a href="https://github.com/kochaiwat1397/ai-news-digest/actions/workflows/daily_digest.yml"
                 target="_blank" rel="noopener noreferrer"
                 className="text-[11px] font-medium text-white/60 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1.5"
                 title="Temporarily pause daily automation">
                 ⏸️ Pause
              </a>
            </div>
          </div>
        </header>

        <TimelineContent data={data} dates={dates} />
      </div>
      
      <SearchColumn />
    </div>
  )
}
