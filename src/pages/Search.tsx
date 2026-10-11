import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PostMeta } from '../components/PostCard'
import { PageHeader, Shell } from '../components/Shell'
import { TagList } from '../components/Tags'
import { search } from '../lib/search'
import { useSeo } from '../lib/seo'

export default function Search() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const hits = useMemo(() => search(q), [q])
  useSeo({ title: q ? `Search: ${q}` : 'Search', description: 'Search all posts.', path: '/search' })

  return (
    <Shell>
      <PageHeader eyebrow="Search" title={q ? `Results for “${q}”` : 'Search'}>
        {q ? `${hits.length} result${hits.length === 1 ? '' : 's'} across titles, descriptions, tags and full text.` : 'Type a query to search titles, descriptions, tags and full text.'}
      </PageHeader>
      <form
        role="search"
        className="mb-8 max-w-[560px]"
        onSubmit={(e) => {
          e.preventDefault()
          const v = new FormData(e.currentTarget).get('q')
          setParams(v ? { q: String(v) } : {})
        }}
      >
        <label htmlFor="page-q" className="sr-only">
          Search query
        </label>
        <input
          id="page-q"
          name="q"
          type="search"
          defaultValue={q}
          key={q}
          placeholder="Search posts…"
          className="h-12 w-full rounded-control border border-border bg-surface px-4 text-[16px] text-text outline-none transition-colors duration-200 placeholder:text-muted focus:border-accent"
        />
      </form>

      {q && hits.length === 0 && (
        <p className="rounded-card border border-dashed border-border-strong p-8 text-center text-text-2">
          Nothing found. Try a shorter query or <Link to="/tags" className="text-accent underline underline-offset-4">browse tags</Link>.
        </p>
      )}
      <ul className="flex flex-col gap-4">
        {hits.map(({ post, snippet }, i) => (
          <li
            key={post.slug}
            className="rise relative rounded-card border border-border bg-surface p-5 transition-colors duration-200 hover:border-border-strong sm:p-6"
            style={{ '--i': Math.min(i, 8) } as React.CSSProperties}
          >
            <PostMeta post={post} />
            <h2 className="mt-2 font-serif text-[22px] font-medium leading-snug text-text">
              <Link to={`/posts/${post.slug}`} className="after:absolute after:inset-0 after:rounded-card">
                {post.title}
              </Link>
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-text-2">{snippet || post.description}</p>
            <div className="relative z-10 mt-3">
              <TagList tags={post.tags} />
            </div>
          </li>
        ))}
      </ul>
    </Shell>
  )
}
