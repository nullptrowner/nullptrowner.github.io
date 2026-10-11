import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageHeader, Shell } from '../components/Shell'
import { deleteDraft, listDrafts, type DraftMeta } from '../lib/schematic-store'
import { renderStaticSvg } from '../lib/schematic-svg'
import { schematics } from '../lib/schematics'
import { useSeo } from '../lib/seo'

function Thumbnail({ svg }: { svg: string }) {
  return (
    <div
      className="aspect-[16/10] w-full overflow-hidden rounded-t-card [&>svg]:h-full [&>svg]:w-full [&>svg]:object-cover"
      // The SVG string comes from our own renderer (renderStaticSvg), not user HTML.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

export default function Schematics() {
  useSeo({ title: 'Schematics', description: 'Block diagrams and system sketches, drawn and exported from the in-browser editor.', path: '/schematics' })
  const [drafts, setDrafts] = useState<DraftMeta[]>(() => listDrafts())
  const navigate = useNavigate()

  return (
    <Shell>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <PageHeader eyebrow={`${schematics.length} published`} title="Schematics">
          Block diagrams built with the in-browser editor. Draft here, export .json/.svg/.png/.md, publish by committing the .json to{' '}
          <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px]">content/schematics/</code>.
        </PageHeader>
        <Link to="/schematics/new" className="btn-ghost shrink-0">
          <Plus size={16} /> New schematic
        </Link>
      </div>

      {schematics.length === 0 ? (
        <p className="mb-14 rounded-card border border-dashed border-border-strong p-8 text-center text-text-2">No schematics published yet.</p>
      ) : (
        <ul className="mb-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {schematics.map((s, i) => (
            <li key={s.slug} className="rise" style={{ '--i': i } as React.CSSProperties}>
              <Link
                to={`/schematics/${s.slug}`}
                className="group block overflow-hidden rounded-card border border-border bg-surface transition-colors duration-200 hover:border-border-strong"
              >
                <Thumbnail svg={renderStaticSvg(s)} />
                <div className="p-4">
                  <h2 className="font-serif text-[17px] leading-snug text-text transition-colors group-hover:text-accent">{s.title}</h2>
                  {s.description && <p className="mt-1.5 line-clamp-2 text-[14px] leading-relaxed text-text-2">{s.description}</p>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {drafts.length > 0 && (
        <section aria-labelledby="drafts-h">
          <h2 id="drafts-h" className="label mb-3">
            Drafts in this browser
          </h2>
          <ul className="flex flex-col gap-2">
            {drafts.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3">
                <button type="button" onClick={() => navigate(`/schematics/draft/${d.id}`)} className="min-w-0 flex-1 text-left">
                  <span className="block truncate font-serif text-[15px] text-text">{d.title}</span>
                  <span className="mono-meta">Edited {d.updated}</span>
                </button>
                <button
                  type="button"
                  aria-label={`Delete draft ${d.title}`}
                  className="btn-ghost !min-h-8 !px-2 shrink-0"
                  onClick={() => {
                    deleteDraft(d.id)
                    setDrafts(listDrafts())
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Shell>
  )
}
