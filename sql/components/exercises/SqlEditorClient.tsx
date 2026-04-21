'use client'
import dynamic from 'next/dynamic'

const SqlEditorInner = dynamic(() => import('./SqlEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-28 bg-gray-900 rounded-lg animate-pulse flex items-center justify-center">
      <span className="text-gray-600 text-sm">Loading SQL editor...</span>
    </div>
  ),
})

interface SqlEditorClientProps {
  exerciseId: number
  setupSql: string
  description: string
  initialCompleted?: boolean
}

export default function SqlEditorClient(props: SqlEditorClientProps) {
  return <SqlEditorInner {...props} />
}
