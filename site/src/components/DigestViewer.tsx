'use client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  content: string
  date: string
}

export default function DigestViewer({ content, date }: Props) {
  return (
    <article className="prose prose-invert prose-sm max-w-none
      prose-headings:font-semibold
      prose-h1:text-2xl prose-h1:text-white prose-h1:border-b prose-h1:border-white/10 prose-h1:pb-3
      prose-h2:text-base prose-h2:text-[#a78bfa] prose-h2:mt-8 prose-h2:mb-3
      prose-h3:text-sm prose-h3:text-white/90 prose-h3:mt-5 prose-h3:mb-1.5
      prose-p:text-white/70 prose-p:leading-relaxed prose-p:text-sm
      prose-a:text-[#60a5fa] prose-a:no-underline hover:prose-a:underline
      prose-hr:border-white/10 prose-hr:my-8
      prose-strong:text-white/90
      prose-em:text-white/50
      prose-li:text-white/70 prose-li:text-sm
    ">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </article>
  )
}
