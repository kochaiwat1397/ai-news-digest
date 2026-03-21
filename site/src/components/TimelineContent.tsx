'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import ArchiveSidebar from '@/components/ArchiveSidebar'

interface SearchResult {
  date: string
  title: string
  summary: string
  url: string
  source: string
}

function InnerTimeline({ data, dates }: { data: SearchResult[], dates: string[] }) {
  const searchParams = useSearchParams()
  const q = (searchParams?.get('q') || '').toLowerCase()

  const filteredData = useMemo(() => {
    if (!q) return data
    return data.filter(item => 
      item.title.toLowerCase().includes(q) || 
      item.summary.toLowerCase().includes(q) ||
      item.source.toLowerCase().includes(q)
    )
  }, [data, q])

  // Group data by month-year
  const groupedData: Record<string, SearchResult[]> = {}
  filteredData.forEach(item => {
    try {
      const month = format(parseISO(item.date), 'MMMM yyyy')
      if (!groupedData[month]) groupedData[month] = []
      groupedData[month].push(item)
    } catch {}
  })

  return (
    <>
        <main className="flex-1 w-full max-w-4xl mx-auto px-8 py-10 relative">
          <div className="mb-12 text-center animate-fadeIn">
             <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-accent-blue inline-block mb-3">
               {q ? `Search: "${searchParams?.get('q')}"` : 'AI Historical Timeline'}
             </h1>
             <p className="text-sm text-white/40">
               {q ? `Found ${filteredData.length} entries matching your query.` : 'The evolution of artificial intelligence, curated daily.'}
             </p>
          </div>

          <div className="relative pl-6 sm:pl-0 sm:mx-auto sm:max-w-2xl animate-fadeIn [animation-delay:150ms]">
            {filteredData.length > 0 && <div className="absolute left-[27px] sm:left-1/2 top-4 bottom-0 w-px bg-gradient-to-b from-accent/50 via-white/10 to-transparent transform sm:-translate-x-1/2" />}
            
            {Object.entries(groupedData).map(([month, articles], monthIdx) => (
              <div key={month} className="mb-16">
                 <div className="relative flex justify-start sm:justify-center mb-10 group">
                    <div className="bg-[#080b12] px-4 py-1.5 rounded-full border border-accent/30 text-[10px] font-semibold text-white/60 tracking-widest uppercase z-10 shadow-[0_0_15px_rgba(167,139,250,0.15)] ring-4 ring-[#080b12]">
                      {month}
                    </div>
                 </div>

                 <div className="space-y-8">
                   {articles.map((article, i) => {
                      const isEven = i % 2 === 0;
                      return (
                        <div key={i} className={`relative flex items-center justify-start sm:justify-between w-full`}>
                          <div className="absolute left-0 sm:left-1/2 w-2.5 h-2.5 bg-accent rounded-full transform -translate-x-[5px] sm:-translate-x-1/2 ring-4 ring-[#080b12] z-10 box-content" />
                          <div className={`w-full sm:w-[calc(50%-2rem)] ml-8 sm:ml-0 ${isEven ? 'sm:text-right sm:pr-0' : 'sm:ml-auto'}`}>
                             <a href={article.url} target="_blank" rel="noopener noreferrer" className={`block bg-[#0f1117] border border-white/10 rounded-xl p-4 hover:bg-[#141928] hover:border-accent/40 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group`}>
                               <div className={`text-[9px] uppercase tracking-wider font-mono text-white/30 mb-2.5 flex items-center gap-2 ${isEven ? 'sm:justify-end' : ''}`}>
                                 <span className="bg-white/5 border border-white/5 rounded px-1.5 py-0.5">{article.source}</span>
                                 <span>{format(parseISO(article.date), 'MMM d')}</span>
                               </div>
                               <h3 className="text-sm font-medium text-white/90 mb-2 leading-snug group-hover:text-white transition-colors">{article.title}</h3>
                               <p className="text-[11px] text-white/40 line-clamp-2 leading-relaxed">{article.summary}</p>
                             </a>
                          </div>
                        </div>
                      )
                   })}
                 </div>
              </div>
            ))}
          </div>
        </main>
        
        <div className="hidden sm:block fixed inset-y-0 left-0 z-20">
          <ArchiveSidebar dates={dates} />
        </div>
    </>
  )
}

export default function TimelineContent({ data, dates }: { data: SearchResult[], dates: string[] }) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-white/50">Loading timeline...</div>}>
      <InnerTimeline data={data} dates={dates} />
    </Suspense>
  )
}
