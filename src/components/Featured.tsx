import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDate, type Post } from '../lib/posts'
import { categoryLabel } from '../lib/site'

export function Featured({ posts }: { posts: Post[] }) {
  const [lead, ...rest] = posts
  if (!lead) return null
  return (
    <section aria-labelledby="featured-h">
      <h2 id="featured-h" className="label mb-4">
        Featured
      </h2>
      <article className="rise group relative overflow-hidden rounded-[24px] bg-[var(--panel-bg)] text-[var(--panel-text)]">
        <div className="grid gap-0 md:grid-cols-[1.2fr_1fr]">
          <div className="flex flex-col p-6 sm:p-8">
            <p className="font-mono text-[12px] tracking-wide text-[var(--panel-muted)]">
              {categoryLabel(lead.category)} · {formatDate(lead.date, 'short')} · {lead.minutes} min
            </p>
            <h3 className="mt-3 font-serif text-[28px] font-medium leading-[1.15] tracking-[-0.01em] sm:text-[32px]">
              <Link to={`/posts/${lead.slug}`} className="after:absolute after:inset-0">
                {lead.title}
              </Link>
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--panel-muted)]">{lead.description}</p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm text-[var(--panel-text)] transition-transform duration-200 group-hover:translate-x-0.5">
              Read <ArrowUpRight size={16} />
            </span>
          </div>
          {lead.cover && (
            <div className="hidden border-l border-white/10 md:block">
              <img src={lead.cover} alt="" className="h-full w-full object-cover" />
            </div>
          )}
        </div>
      </article>

      {rest.length > 0 && (
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {rest.map((p, i) => (
            <li key={p.slug} className="rise" style={{ '--i': i + 1 } as React.CSSProperties}>
              <Link
                to={`/posts/${p.slug}`}
                className="group flex h-full items-start gap-4 rounded-card border border-border bg-surface p-5 transition-colors duration-200 hover:border-border-strong"
              >
                <span className="font-mono text-[12px] text-muted">0{i + 2}</span>
                <span>
                  <span className="block font-serif text-[18px] leading-snug text-text transition-colors group-hover:text-accent">{p.title}</span>
                  <span className="mono-meta mt-1 block">{categoryLabel(p.category)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
