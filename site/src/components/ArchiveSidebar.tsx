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
        {Object.entries(grouped).map(([month, monthDates]) => (
          <div key={month}>
            <p className="text-[10px] font-medium text-white/25 uppercase tracking-wider mb-1.5 px-2">
              {month}
            </p>
            <div className="space-y-0.5">
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
                    className={`group flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg
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
          </div>
        ))}
      </nav>
    </aside>
  )
}
