import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import DigestViewer from '../components/DigestViewer'
import ArchiveSidebar from '../components/ArchiveSidebar'

const DIGESTS_DIR = join(process.cwd(), '..', 'digests')

function getAvailableDates(): string[] {
  try {
    return readdirSync(DIGESTS_DIR)
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace('.md', ''))
      .sort()
      .reverse()
  } catch { return [] }
}

function getDigestContent(date: string): string {
  try {
    return readFileSync(join(DIGESTS_DIR, `${date}.md`), 'utf-8')
  } catch {
    return `# No digest yet\n\nThe first digest hasn't been generated yet. Trigger the **Daily AI News Digest** workflow in GitHub Actions.`
  }
}

export default function Home() {
  const dates = getAvailableDates()
  const selectedDate = dates[0] || new Date().toISOString().split('T')[0]
  const content = getDigestContent(selectedDate)

  return <PageLayout dates={dates} selectedDate={selectedDate} content={content} />
}

function PageLayout({ dates, selectedDate, content }: {
  dates: string[]; selectedDate: string; content: string
}) {
  return (
    <div className="min-h-screen bg-glow text-[#e8e6e0]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06]
        bg-[#08090e]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg">⚡</span>
            <span className="font-semibold text-sm tracking-tight">
              Anti-Gravity{' '}
              <span className="gradient-text">AI Digest</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-white/25">{selectedDate}</span>
            <span className="h-4 w-px bg-white/10" />
            <span className="text-[11px] text-white/25">Daily · Automated · OpenAI</span>
          </div>
        </div>
      </header>

      <div className="flex max-w-6xl mx-auto">
        <ArchiveSidebar dates={dates} />

        <main className="flex-1 min-w-0 px-8 py-8">
          <DigestViewer content={content} date={selectedDate} />
        </main>
      </div>
    </div>
  )
}
