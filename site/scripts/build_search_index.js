const fs = require('fs')
const path = require('path')

const digestsDir = path.join(__dirname, '../../digests')
const outputJson = path.join(__dirname, '../public/search-index.json')

if (!fs.existsSync(digestsDir)) {
  console.log('No digests found, creating empty search index.')
  fs.mkdirSync(path.dirname(outputJson), { recursive: true })
  fs.writeFileSync(outputJson, JSON.stringify([]))
  process.exit(0)
}

const files = fs.readdirSync(digestsDir).filter(f => f.endsWith('.md'))
const searchIndex = []

console.log(`Parsing ${files.length} digest files...`)

files.forEach(file => {
  const content = fs.readFileSync(path.join(digestsDir, file), 'utf-8')
  const dateStr = file.replace('.md', '')
  
  const lines = content.split('\n')
  let currentArticle = null
  let summaryLines = []
  
  function saveArticle() {
    if (currentArticle && currentArticle.title) {
      searchIndex.push({
        date: dateStr,
        title: currentArticle.title,
        summary: currentArticle.summary || summaryLines.join(' ').trim().slice(0, 160),
        url: currentArticle.url || '#',
        source: currentArticle.source || ''
      })
    }
    currentArticle = null
    summaryLines = []
  }
  
  for (const line of lines) {
    if (line.startsWith('### ')) {
      saveArticle()
      currentArticle = { title: line.slice(4).trim() }
    } else if (line.startsWith('[') && currentArticle) {
      const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/)
      const sourceMatch = line.match(/—\s*\*([^*]+)\*/)
      if (linkMatch) currentArticle.url = linkMatch[2]
      if (sourceMatch) currentArticle.source = sourceMatch[1]
    } else if (line.trim() && currentArticle && !line.startsWith('---') && !line.startsWith('## ')) {
      const trimmed = line.trim()
      // Exclude footer lines starting with *
      if (trimmed.startsWith('*') && trimmed.endsWith('*') && trimmed.includes('articles reviewed')) continue

      if (trimmed.startsWith('**TL;DR:**')) {
        currentArticle.summary = trimmed.replace('**TL;DR:**', '').trim()
      } else if (!trimmed.startsWith('- ')) {
        summaryLines.push(trimmed)
      }
    }
  }
  saveArticle()
})

// Sort index by date (newest first)
searchIndex.sort((a, b) => b.date.localeCompare(a.date))

fs.mkdirSync(path.dirname(outputJson), { recursive: true })
fs.writeFileSync(outputJson, JSON.stringify(searchIndex))
console.log(`✅ Built search index containing ${searchIndex.length} articles.`)
