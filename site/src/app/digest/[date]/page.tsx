import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import DigestViewer from '../../../components/DigestViewer'
import ArchiveSidebar from '../../../components/ArchiveSidebar'

const DIGESTS_DIR = join(process.cwd(), '..', 'digests')

function getAvailableDates(): string[] {
  try {
    return readdirSync(DIGESTS_DIR)
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace('.md', ''))
      .sort()
      .reverse()
  } catch {
    return []
  }
}

function getDigestContent(date: string): string {
  try {
    return readFileSync(join(DIGESTS_DIR, `${date}.md`), 'utf-8')
  } catch {
    return `# No digest found for ${date}\n\nThe digest for this date has not been generated yet.`
  }
}

export function generateStaticParams() {
  const dates = getAvailableDates()
  return dates.map(date => ({
    date: date,
  }))
}

interface PageProps {
  params: { date: string }
}

export default function DigestPage({ params }: PageProps) {
  const dates = getAvailableDates()
  const selectedDate = params.date
  const content = getDigestContent(selectedDate)

  return (
    <div className="min-h-screen bg-[#0d0f14] text-[#e8e6e0]">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            ⚡ Anti-Gravity <span className="text-[#a78bfa]">AI Digest</span>
          </h1>
          <p className="text-xs text-white/40 mt-0.5">Daily intelligence, curated by Claude</p>
        </div>
        <div className="text-xs text-white/30 font-mono">{selectedDate}</div>
      </header>

      <div className="flex max-w-6xl mx-auto">
        {/* Sidebar */}
        <ArchiveSidebar dates={dates} selectedDate={selectedDate} />

        {/* Main content */}
        <main className="flex-1 px-8 py-8 max-w-3xl">
          <DigestViewer content={content} date={selectedDate} />
        </main>
      </div>
    </div>
  )
}
