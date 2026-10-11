import { ArrowUpRight } from 'lucide-react'
import { PageHeader, Shell } from '../components/Shell'
import { useSeo } from '../lib/seo'
import { categoryLabel, projects } from '../lib/site'

export default function Projects() {
  useSeo({ title: 'Projects', description: 'Open-source work, tools and experiments.', path: '/projects' })
  return (
    <Shell>
      <PageHeader eyebrow={`${projects.length} entries`} title="Projects">
        Open-source work, tools and experiments.
      </PageHeader>
      {projects.length === 0 ? (
        <p className="rounded-card border border-dashed border-border-strong p-8 text-center text-text-2">
          No projects yet. Add one in <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px]">content/projects.json</code>.
        </p>
      ) : (
      <ul className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface">
        {projects.map((p, i) => {
          const body = (
            <>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h2 className="font-mono text-[17px] font-medium text-text">{p.name}</h2>
                <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[11px] text-muted">{p.status}</span>
                <span className="mono-meta">{categoryLabel(p.category)}</span>
                {p.url && <ArrowUpRight size={16} className="ml-auto text-muted transition-colors group-hover:text-accent" />}
              </div>
              <p className="mt-2 max-w-[560px] text-[15px] leading-relaxed text-text-2">{p.description}</p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {p.stack.map((s) => (
                  <li key={s} className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[12px] text-text-2">
                    {s}
                  </li>
                ))}
              </ul>
            </>
          )
          const cls = 'group block p-5 transition-colors duration-200 sm:p-6'
          return (
            <li key={p.name} className="rise" style={{ '--i': i } as React.CSSProperties}>
              {p.url ? (
                <a href={p.url} target="_blank" rel="noopener noreferrer" className={`${cls} hover:bg-surface-2`}>
                  {body}
                </a>
              ) : (
                <div className={cls}>{body}</div>
              )}
            </li>
          )
        })}
      </ul>
      )}
    </Shell>
  )
}
