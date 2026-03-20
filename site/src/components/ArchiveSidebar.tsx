'use client'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'

interface Props {
  dates: string[]
  selectedDate: string
}

export default function ArchiveSidebar({ dates, selectedDate }: Props) {
  if (dates.length === 0) return null

  return (
    <aside className="w-52 shrink-0 border-r border-white/10 px-4 py-6 sticky top-0 h-screen overflow-y-auto">
      <p className="text-xs font-medium text-white/30 uppercase tracking-widest mb-3">Archive</p>
      <nav className="space-y-0.5">
        {dates.map(date => {
          const isSelected = date === selectedDate
          let label = date
          try {
            label = format(parseISO(date), 'MMM d, yyyy')
          } catch {}

          return (
            <Link
              key={date}
              href={`/?date=${date}`}
              className={`block text-xs px-3 py-2 rounded-md transition-colors ${
                isSelected
                  ? 'bg-[#a78bfa]/20 text-[#a78bfa] font-medium'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
