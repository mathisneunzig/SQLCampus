import { marked } from 'marked'
import CodeBlock from './CodeBlock'

interface LessonContentProps {
  content: string
}

// Parse markdown and extract code blocks for shiki rendering
export default async function LessonContent({ content }: LessonContentProps) {
  // Split content into segments: text and code blocks
  const segments: Array<{ type: 'text' | 'code'; content: string; lang?: string }> = []
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g
  let lastIndex = 0
  let match

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: content.slice(lastIndex, match.index) })
    }
    segments.push({ type: 'code', content: match[2].trim(), lang: match[1] || 'sql' })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < content.length) {
    segments.push({ type: 'text', content: content.slice(lastIndex) })
  }

  return (
    <div className="prose prose-blue max-w-none">
      {await Promise.all(segments.map(async (seg, i) => {
        if (seg.type === 'code') {
          return <CodeBlock key={i} code={seg.content} lang={seg.lang} />
        }
        const html = await marked.parse(seg.content)
        return (
          <div
            key={i}
            className="lesson-prose"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )
      }))}
    </div>
  )
}
