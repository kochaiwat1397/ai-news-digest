'use client'

interface Article {
  title: string
  summary: string
  url: string
  source: string
}

interface Section {
  emoji: string
  label: string
  color: string
  bg: string
  border: string
  articles: Article[]
}

const CATEGORY_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  '🔬': { color: 'text-violet-300',  bg: 'bg-violet-500/10',  border: 'border-violet-500/30' },
  '🏭': { color: 'text-blue-300',    bg: 'bg-blue-500/10',    border: 'border-blue-500/30'   },
  '⚖️': { color: 'text-amber-300',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30'  },
  '🛠️': { color: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30'},
  '🤖': { color: 'text-rose-300',    bg: 'bg-rose-500/10',    border: 'border-rose-500/30'   },
  '💡': { color: 'text-yellow-300',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/30' },
  '📊': { color: 'text-cyan-300',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/30'   },
}

const DEFAULT_COLOR = { color: 'text-slate-300', bg: 'bg-slate-500/10', border: 'border-slate-500/30' }

function parseDigest(markdown: string): { title: string; sections: Section[]; footer: string } {
  const lines = markdown.split('\n')
  let title = ''
  let footer = ''
  const sections: Section[] = []
  let currentSection: Section | null = null
  let currentArticle: Partial<Article> | null = null
  let summaryLines: string[] = []

  function saveArticle() {
    if (currentSection && currentArticle?.title) {
      currentSection.articles.push({
        title: currentArticle.title,
        summary: summaryLines.join(' ').trim().slice(0, 160),
        url: currentArticle.url || '#',
        source: currentArticle.source || '',
      })
    }
    currentArticle = null
    summaryLines = []
  }

  for (const line of lines) {
    if (line.startsWith('# ')) {
      title = line.slice(2).trim()
    } else if (line.startsWith('## ')) {
      saveArticle()
      if (currentSection) sections.push(currentSection)
      const label = line.slice(3).trim()
      const emoji = [...label].find(c => /\p{Emoji}/u.test(c) && c !== ' ') || '📌'
      const style = CATEGORY_COLORS[emoji] || DEFAULT_COLOR
      currentSection = { emoji, label: label.replace(emoji, '').trim(), ...style, articles: [] }
    } else if (line.startsWith('### ')) {
      saveArticle()
      currentArticle = { title: line.slice(4).trim() }
    } else if (line.startsWith('[') && currentArticle) {
      const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/)
      const sourceMatch = line.match(/—\s*\*([^*]+)\*/)
      if (linkMatch) currentArticle.url = linkMatch[2]
      if (sourceMatch) currentArticle.source = sourceMatch[1]
    } else if (line.startsWith('---') || line.startsWith('*')) {
      footer = line.replace(/^\*|\*$/g, '').trim()
    } else if (line.trim() && currentArticle) {
      summaryLines.push(line.trim())
    }
  }

  saveArticle()
  if (currentSection) sections.push(currentSection)

  return { title, sections, footer }
}

interface Props { content: string; date: string }

export default function DigestViewer({ content, date }: Props) {
  const { title, sections, footer } = parseDigest(content)
  const totalArticles = sections.reduce((s, sec) => s + sec.articles.length, 0)

  return (
    <div className="animate-fadeIn space-y-8">

      {/* Stats bar */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-xs font-mono text-white/30">{date}</span>
        <span className="h-3 w-px bg-white/10" />
        <span className="text-xs text-white/40">{totalArticles} articles</span>
        <span className="h-3 w-px bg-white/10" />
        <span className="text-xs text-white/40">{sections.length} categories</span>
        {footer && <>
          <span className="h-3 w-px bg-white/10" />
          <span className="text-xs text-white/30 italic">{footer}</span>
        </>}
      </div>

      {/* Category sections */}
      {sections.map(section => (
        <div key={section.label}>
          {/* Category header */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${section.bg} ${section.border} ${section.color}`}>
              {section.emoji} {section.label}
            </span>
            <span className="text-[10px] text-white/20 font-mono">{section.articles.length}</span>
          </div>

          {/* Article cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {section.articles.map((article, i) => (
              <a
                key={i}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group block rounded-xl border ${section.border} bg-[#0f1117]
                  hover:bg-[#141928] transition-all duration-200 p-4 no-underline
                  hover:border-opacity-70 hover:shadow-lg hover:-translate-y-0.5`}
              >
                {/* Title */}
                <p className="text-[0.8rem] font-semibold text-white/90 leading-snug mb-2 line-clamp-2
                  group-hover:text-white transition-colors">
                  {article.title}
                </p>

                {/* Summary */}
                <p className="text-[0.72rem] text-white/40 leading-relaxed line-clamp-2 mb-3">
                  {article.summary}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full
                    ${section.bg} ${section.color} border ${section.border}`}>
                    {article.source}
                  </span>
                  <span className="text-[11px] text-white/25 group-hover:text-white/60 transition-colors">
                    Read →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
