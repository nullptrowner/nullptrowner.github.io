import { Link } from 'react-router-dom'
import { site } from '../lib/site'

export function Brand({ onClick }: { onClick?: () => void }) {
  return (
    <Link to="/" onClick={onClick} className="inline-flex items-center gap-2.5" aria-label={`${site.name} — home`}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent-bg font-mono text-[15px] font-semibold text-accent-on" aria-hidden="true">
        ∅
      </span>
      <span className="font-mono text-[17px] font-medium tracking-tight text-text">{site.name}</span>
    </Link>
  )
}
