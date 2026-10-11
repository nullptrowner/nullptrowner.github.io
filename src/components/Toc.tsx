import { useEffect, useState } from 'react'
import type { TocItem } from '../lib/markdown'

const ACTIVE_OFFSET = 120
const BOTTOM_SLACK = 4

function useActiveHeading(items: TocItem[]) {
  const [active, setActive] = useState(items[0]?.id ?? '')
  useEffect(() => {
    if (items.length === 0) return
    const update = () => {
      let current = items[0].id
      for (const { id } of items) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top - ACTIVE_OFFSET <= 0) current = id
      }
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - BOTTOM_SLACK
      setActive(atBottom ? items[items.length - 1].id : current)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [items])
  return active
}

export function Toc({ items, onPick }: { items: TocItem[]; onPick?: () => void }) {
  const active = useActiveHeading(items)
  if (items.length === 0) return null
  return (
    <nav aria-label="On this page">
      <ul className="flex flex-col border-l border-border">
        {items.map((it) => {
          const isActive = it.id === active
          return (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                aria-current={isActive ? 'location' : undefined}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(it.id)?.scrollIntoView({ block: 'start' })
                  history.replaceState(null, '', `#${it.id}`)
                  onPick?.()
                }}
                className={`-ml-px block border-l py-1.5 pr-2 text-[14px] leading-snug transition-colors duration-200 ${
                  it.depth === 3 ? 'pl-7' : 'pl-4'
                } ${isActive ? 'border-accent font-medium text-accent' : 'border-transparent text-text-2 hover:text-text'}`}
              >
                {it.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
