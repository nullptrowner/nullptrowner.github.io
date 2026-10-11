import { Link } from 'react-router-dom'
import { PageHeader, Shell } from '../components/Shell'
import { tagCounts, tagSlug } from '../lib/posts'
import { useSeo } from '../lib/seo'

export default function Tags() {
  useSeo({ title: 'Tags', description: 'Browse all posts by tag.', path: '/tags' })
  const max = Math.max(...tagCounts.map((t) => t.count), 1)
  return (
    <Shell>
      <PageHeader eyebrow={`${tagCounts.length} tags`} title="Tags">
        Larger count, darker marker. Pick one to see its posts.
      </PageHeader>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {tagCounts.map(({ tag, count }, i) => (
          <li key={tag} className="rise" style={{ '--i': Math.min(i, 12) } as React.CSSProperties}>
            <Link
              to={`/tags/${tagSlug(tag)}`}
              className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 transition-colors duration-200 hover:border-border-strong hover:bg-surface-2"
            >
              <span className="truncate font-mono text-[14px] text-text">{tag}</span>
              <span className="flex items-center gap-2 font-mono text-[12px] text-muted">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" style={{ opacity: 0.25 + 0.75 * (count / max) }} />
                {count}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Shell>
  )
}
