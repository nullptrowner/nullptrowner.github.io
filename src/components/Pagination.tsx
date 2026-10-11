import { ArrowLeft, ArrowRight } from 'lucide-react'

export function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null
  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-between">
      <button type="button" className="btn-ghost disabled:pointer-events-none disabled:opacity-40" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ArrowLeft size={16} /> Newer
      </button>
      <span className="mono-meta" aria-live="polite">
        {page} / {pages}
      </span>
      <button type="button" className="btn-ghost disabled:pointer-events-none disabled:opacity-40" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Older <ArrowRight size={16} />
      </button>
    </nav>
  )
}
