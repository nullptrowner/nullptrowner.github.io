import { buildPost, type Post } from '../../shared/frontmatter.js'

export type { Post }

const raw = import.meta.glob('../../content/posts/*.md', { query: '?raw', import: 'default', eager: true }) as Record<
  string,
  string
>

const byDateDesc = (a: Post, b: Post) => b.date.localeCompare(a.date)

export const posts: Post[] = Object.entries(raw)
  .map(([path, source]) => buildPost(path, source))
  .sort(byDateDesc)

export const getPost = (slug: string) => posts.find((p) => p.slug === slug)

export function neighbours(slug: string) {
  const i = posts.findIndex((p) => p.slug === slug)
  return { newer: i > 0 ? posts[i - 1] : undefined, older: i >= 0 ? posts[i + 1] : undefined }
}

export const featuredPosts = posts.filter((p) => p.featured)

export const recentlyUpdated = (limit = 5) =>
  [...posts].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, limit)

export interface TagCount {
  tag: string
  count: number
}

export const tagCounts: TagCount[] = (() => {
  const counts = new Map<string, number>()
  for (const p of posts) for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1)
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
})()

export const tagSlug = (tag: string) => encodeURIComponent(tag.toLowerCase())

export function filterPosts(opts: { category?: string | null; tag?: string | null }) {
  return posts.filter(
    (p) => (!opts.category || p.category === opts.category) && (!opts.tag || p.tags.some((t) => t.toLowerCase() === opts.tag!.toLowerCase())),
  )
}

export function formatDate(iso: string, style: 'long' | 'short' = 'long') {
  const d = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    day: 'numeric',
  })
}
