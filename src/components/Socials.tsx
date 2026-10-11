import { Icon } from './icons'
import { site } from '../lib/site'

export function Socials({ className = '' }: { className?: string }) {
  return (
    <ul className={`flex items-center gap-1 ${className}`}>
      {site.socials.map((s) => {
        const external = /^https?:/.test(s.url)
        return (
          <li key={s.id}>
            <a
              href={s.url}
              aria-label={s.label}
              title={s.label}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="grid h-10 w-10 place-items-center rounded-control text-muted transition-colors duration-200 hover:bg-surface-2 hover:text-text"
            >
              <Icon name={s.id} />
            </a>
          </li>
        )
      })}
    </ul>
  )
}
