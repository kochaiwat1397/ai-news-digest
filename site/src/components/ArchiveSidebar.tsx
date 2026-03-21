'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { format, parseISO } from 'date-fns'

interface Props { dates: string[] }

function groupByMonth(dates: string[]): Record<string, string[]> {
  return dates.reduce((acc, date) => {
    const key = format(parseISO(date), 'MMMM yyyy')
    if (!acc[key]) acc[key] = []
    acc[key].push(date)
    return acc
  }, {} as Record<string, string[]>)
}

export default function ArchiveSidebar({ dates }: Props) {
  const pathname = usePathname()
  if (dates.length === 0) return null

  const grouped = groupByMonth(dates)

  return (
    <aside className="w-56 shrink-0 border-r border-white/[0.06] px-3 py-6 sticky top-0 h-screen overflow-y-auto">
      <p className="text-[10px] font-semibold text-white/20 uppercase tracking-widest mb-4 px-2">
        Archive
      </p>

      <nav className="space-y-5">
        {Object.entries(grouped).map(([month, monthDates], idx) => (
          <details key={month} open={idx === 0} className="group">
            <summary className="cursor-pointer list-none select-none text-[10px] items-center font-medium text-white/30 hover:text-white/60 uppercase tracking-wider mb-2 px-2 flex gap-1.5 [&::-webkit-details-marker]:hidden transition-colors">
              <span className="text-[8px] transform transition-transform group-open:rotate-90 opacity-60">▶</span>
              {month}
            </summary>
            <div className="space-y-0.5 ml-2 border-l border-white/5 pl-2 mb-5">
              {monthDates.map(date => {
                const isHome = pathname === '/' && monthDates[0] === date && dates[0] === date
                const isDigest = pathname === `/digest/${date}`
                const isActive = isHome || isDigest

                let label = date
                try { label = format(parseISO(date), 'MMM d') } catch {}

                return (
                  <Link
                    key={date}
                    href={date === dates[0] ? '/' : `/digest/${date}`}
                    className={`group/link flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg
                      transition-all duration-150 ${
                        isActive
                          ? 'bg-gradient-to-r from-accent/20 to-accent-blue/10 text-white font-medium border border-accent/20'
                          : 'text-white/35 hover:text-white/70 hover:bg-white/5'
                      }`}
                  >
                    {isActive && (
                      <span className="w-1 h-1 rounded-full bg-accent shrink-0" />
                    )}
                    <span className="font-mono">{label}</span>
                  </Link>
                )
              })}
            </div>
          </details>
        ))}
      </nav>
    </aside>
  )
}
