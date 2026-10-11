import { Search as SearchIcon } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { search } from '../lib/search'

const SUGGESTION_LIMIT = 5

export function SearchBox({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const initial = location.pathname === '/search' ? (params.get('q') ?? '') : ''
  const [value, setValue] = useState(initial)
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement).tagName)
      if ((e.key === '/' && !typing) || (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [])

  const suggestions = useMemo(() => search(value).slice(0, SUGGESTION_LIMIT), [value])
  const showList = open && value.trim().length > 0 && location.pathname !== '/search'

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = value.trim()
    if (!q) return
    setOpen(false)
    inputRef.current?.blur()
    navigate(`/search?q=${encodeURIComponent(q)}`)
    onNavigate?.()
  }

  return (
    <div ref={rootRef} className="relative w-full">
      <form role="search" onSubmit={submit}>
        <label htmlFor={`${listId}-in`} className="sr-only">
          Search posts
        </label>
        <div className="relative">
          <SearchIcon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            id={`${listId}-in`}
            ref={inputRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setOpen(false)
                inputRef.current?.blur()
              }
            }}
            type="search"
            autoComplete="off"
            placeholder="Search"
            aria-controls={showList ? listId : undefined}
            className="h-10 w-full rounded-control border border-border bg-surface pl-9 pr-10 text-[15px] text-text outline-none transition-colors duration-200 placeholder:text-muted hover:border-border-strong focus:border-accent focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border px-1.5 font-mono text-[11px] text-muted sm:block">
            /
          </kbd>
        </div>
      </form>
      {showList && (
        <ul
          id={listId}
          className="absolute left-0 right-0 top-12 z-40 overflow-hidden rounded-xl border border-border bg-surface shadow-soft"
        >
          {suggestions.length === 0 && <li className="px-4 py-3 text-sm text-muted">No matches</li>}
          {suggestions.map(({ post }) => (
            <li key={post.slug}>
              <Link
                to={`/posts/${post.slug}`}
                onClick={() => {
                  setOpen(false)
                  onNavigate?.()
                }}
                className="block px-4 py-2.5 transition-colors duration-150 hover:bg-surface-2 focus-visible:bg-surface-2"
              >
                <span className="block truncate font-serif text-[15px] text-text">{post.title}</span>
                <span className="mono-meta">{post.tags.slice(0, 3).join(' · ')}</span>
              </Link>
            </li>
          ))}
          {suggestions.length > 0 && (
            <li className="border-t border-border">
              <Link
                to={`/search?q=${encodeURIComponent(value.trim())}`}
                onClick={() => {
                  setOpen(false)
                  onNavigate?.()
                }}
                className="block px-4 py-2.5 text-sm text-accent hover:bg-surface-2"
              >
                See all results
              </Link>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
