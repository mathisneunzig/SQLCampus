import { codeToHtml } from 'shiki'

interface CodeBlockProps {
  code: string
  lang?: string
}

export default async function CodeBlock({ code, lang = 'sql' }: CodeBlockProps) {
  const html = await codeToHtml(code, {
    lang,
    theme: 'github-light',
  })

  return (
    <div
      className="rounded-lg border border-blue-100 bg-blue-50 text-sm font-mono overflow-x-auto code-scroll my-3"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
