import { Link } from 'react-router-dom'
import { Shell } from '../components/Shell'
import { useSeo } from '../lib/seo'

export default function NotFound() {
  useSeo({ title: '404', description: 'Page not found.', path: '/404' })
  return (
    <Shell>
      <div className="mx-auto max-w-[520px] py-16 text-center">
        <p className="font-mono text-[64px] font-light leading-none text-accent">404</p>
        <h1 className="mt-6 font-serif text-[32px] font-medium tracking-[-0.01em] text-text">Null pointer dereference</h1>
        <p className="mt-3 text-text-2">There is nothing at this address. The page was moved, renamed, or never existed.</p>
        <div className="mt-8 flex justify-center gap-2">
          <Link to="/" className="btn-ghost">
            Home
          </Link>
          <Link to="/writing" className="btn-ghost">
            Writing
          </Link>
          <Link to="/search" className="btn-ghost">
            Search
          </Link>
        </div>
      </div>
    </Shell>
  )
}
