import { X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { Pagination } from '../components/Pagination'
import { PostCard } from '../components/PostCard'
import { RightPanel } from '../components/RightPanel'
import { PageHeader, Shell } from '../components/Shell'
import { filterPosts, posts } from '../lib/posts'
import { useSeo } from '../lib/seo'
import { categoryLabel, site } from '../lib/site'

const PAGE_SIZE = 8

export default function Writing({ fixedTag }: { fixedTag?: string }) {
  const [params, setParams] = useSearchParams()
  const category = params.get('category')
  const tag = fixedTag ?? params.get('tag')
  const page = Math.max(1, Number(params.get('page')) || 1)

  const filtered = filterPosts({ category, tag })
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pages)
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  const title = fixedTag ? `#${fixedTag}` : 'Writing'
  useSeo({
    title,
    description: fixedTag ? `Posts tagged “${fixedTag}”.` : 'All posts: engineering notes, projects and experiments.',
    path: fixedTag ? `/tags/${encodeURIComponent(fixedTag)}` : '/writing',
  })

  const update = (next: Record<string, string | null>) => {
    const p = new URLSearchParams(params)
    for (const [k, v] of Object.entries(next)) {
      if (v) p.set(k, v)
      else p.delete(k)
    }
    if (!('page' in next)) p.delete('page')
    setParams(p, { replace: true })
  }

  return (
    <Shell aside={<RightPanel />}>
      <PageHeader eyebrow={fixedTag ? 'Tag' : `${posts.length} posts`} title={title}>
        {fixedTag ? `${filtered.length} post${filtered.length === 1 ? '' : 's'} with this tag.` : 'Everything in one place. Filter by category or follow a tag.'}
      </PageHeader>

      <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        <button type="button" className="chip" aria-pressed={!category} onClick={() => update({ category: null })}>
          All
        </button>
        {site.categories.map((c) => (
          <button key={c.id} type="button" className="chip" aria-pressed={category === c.id} onClick={() => update({ category: category === c.id ? null : c.id })}>
            {c.label}
          </button>
        ))}
      </div>

      {tag && !fixedTag && (
        <p className="mb-6 flex items-center gap-2 text-sm text-text-2">
          Tag
          <button type="button" className="chip font-mono" data-active="true" onClick={() => update({ tag: null })} aria-label={`Remove tag filter ${tag}`}>
            {tag} <X size={12} className="ml-1.5" />
          </button>
        </p>
      )}

      {visible.length === 0 ? (
        <p className="rounded-card border border-dashed border-border-strong p-8 text-center text-text-2">
          No posts match these filters{category ? ` in ${categoryLabel(category)}` : ''}.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {visible.map((p, i) => (
            <PostCard key={p.slug} post={p} index={i} />
          ))}
        </div>
      )}
      <Pagination page={current} pages={pages} onChange={(n) => update({ page: n === 1 ? null : String(n) })} />
    </Shell>
  )
}
