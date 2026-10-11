import { Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDate, type Post } from '../lib/posts'
import { categoryLabel } from '../lib/site'
import { TagList } from './Tags'

export function PostMeta({ post }: { post: Post }) {
  return (
    <div className="mono-meta flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="text-accent">{categoryLabel(post.category)}</span>
      <time dateTime={post.date}>{formatDate(post.date, 'short')}</time>
      <span className="inline-flex items-center gap-1">
        <Clock size={12} /> {post.minutes} min read
      </span>
    </div>
  )
}

export function PostCard({ post, index = 0 }: { post: Post; index?: number }) {
  return (
    <article
      className="rise group relative rounded-card border border-border bg-surface p-5 transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-soft sm:p-6"
      style={{ '--i': index } as React.CSSProperties}
    >
      <div className="flex gap-5">
        <div className="min-w-0 flex-1">
          <PostMeta post={post} />
          <h2 className="mt-2 font-serif text-[22px] font-medium leading-snug tracking-[-0.01em] text-text sm:text-2xl">
            <Link to={`/posts/${post.slug}`} className="after:absolute after:inset-0 after:rounded-card">
              {post.title}
            </Link>
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-text-2">{post.description}</p>
          <div className="relative z-10 mt-4">
            <TagList tags={post.tags} />
          </div>
        </div>
        {post.cover && (
          <img
            src={post.cover}
            alt=""
            loading="lazy"
            className="hidden h-28 w-28 shrink-0 rounded-xl border border-border object-cover sm:block"
          />
        )}
      </div>
    </article>
  )
}
