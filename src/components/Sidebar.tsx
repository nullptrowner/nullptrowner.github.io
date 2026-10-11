import { NavLink } from 'react-router-dom'
import { site } from '../lib/site'
import { Brand } from './Brand'
import { Icon } from './icons'
import { Socials } from './Socials'
import { ThemeToggle } from './ThemeToggle'

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col px-5 py-6">
      <Brand onClick={onNavigate} />
      <p className="mt-4 max-w-[220px] font-serif text-[15px] leading-snug text-text-2">{site.author.role} · notes &amp; experiments</p>

      <nav aria-label="Primary" className="mt-8 flex flex-col gap-0.5">
        {site.nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex min-h-10 items-center gap-3 rounded-control px-3 text-[15px] transition-colors duration-200 ${
                isActive ? 'bg-accent-bg text-accent-on' : 'text-text-2 hover:bg-surface-2 hover:text-text'
              }`
            }
          >
            <Icon name={item.icon} size={17} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex items-center justify-between gap-2 pt-8">
        <Socials className="-ml-2" />
        <ThemeToggle />
      </div>
    </div>
  )
}
