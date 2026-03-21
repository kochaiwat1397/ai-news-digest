'use client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

interface Props { content: string; date: string }

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-white mb-6 pb-4 border-b border-white/10">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <div className="mt-10 mb-4 flex items-center gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-accent">
        {children}
      </h2>
      <div className="flex-1 h-px bg-gradient-to-r from-accent/20 to-transparent" />
    </div>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-white/90 mt-6 mb-1 leading-snug">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-[0.875rem] text-white/60 leading-relaxed mb-2">
      {children}
    </p>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs font-medium text-accent-blue/80
        hover:text-accent-blue transition-colors duration-150 no-underline
        border border-accent-blue/20 hover:border-accent-blue/50
        rounded-md px-2 py-0.5 hover:bg-accent-blue/5"
    >
      {children}
    </a>
  ),
  hr: () => (
    <hr className="border-none h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-10" />
  ),
  ul: ({ children }) => <ul className="space-y-1 mb-3">{children}</ul>,
  li: ({ children }) => (
    <li className="text-[0.875rem] text-white/60 pl-4 relative before:content-['·']
      before:absolute before:left-0 before:text-accent/60">
      {children}
    </li>
  ),
  em: ({ children }) => (
    <em className="not-italic text-xs text-white/30 font-mono">{children}</em>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-white/80">{children}</strong>
  ),
}

export default function DigestViewer({ content }: Props) {
  return (
    <article className="animate-fadeIn">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </article>
  )
}
