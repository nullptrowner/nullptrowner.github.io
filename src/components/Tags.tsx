import { Link } from 'react-router-dom'
import { tagSlug } from '../lib/posts'

export function TagList({ tags, size = 'sm' }: { tags: string[]; size?: 'sm' | 'md' }) {
  if (tags.length === 0) return null
  return (
    <ul className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <li key={t}>
          <Link to={`/tags/${tagSlug(t)}`} className={`chip font-mono ${size === 'sm' ? '!min-h-6 !text-[12px] !px-2' : ''}`}>
            {t}
          </Link>
        </li>
      ))}
    </ul>
  )
}
