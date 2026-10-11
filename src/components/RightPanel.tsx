import { Link } from 'react-router-dom'
import { formatDate, recentlyUpdated, tagCounts, tagSlug } from '../lib/posts'

const TRENDING_LIMIT = 12

export function RightPanel() {
  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="recent-h">
        <h2 id="recent-h" className="label mb-3">
          Recently updated
        </h2>
        <ul className="flex flex-col gap-3">
          {recentlyUpdated().map((p) => (
            <li key={p.slug}>
              <Link to={`/posts/${p.slug}`} className="group block">
                <span className="block font-serif text-[16px] leading-snug text-text transition-colors duration-200 group-hover:text-accent">
                  {p.title}
                </span>
                <span className="mono-meta">{formatDate(p.updated, 'short')}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="trend-h">
        <h2 id="trend-h" className="label mb-3">
          Trending tags
        </h2>
        <ul className="flex flex-wrap gap-1.5">
          {tagCounts.slice(0, TRENDING_LIMIT).map(({ tag, count }) => (
            <li key={tag}>
              <Link to={`/tags/${tagSlug(tag)}`} className="chip font-mono !text-[12px]">
                {tag}
                <span className="ml-1.5 text-muted">{count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
