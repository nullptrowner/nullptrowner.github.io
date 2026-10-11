import { Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { site } from '../lib/site'
import { Brand } from './Brand'
import { SearchBox } from './SearchBox'
import { Sidebar } from './Sidebar'
import { Socials } from './Socials'
import { ThemeToggle } from './ThemeToggle'

function useScrollReset() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) return
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash])
}

export function Layout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const menuButton = useRef<HTMLButtonElement>(null)
  useScrollReset()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        menuButton.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only z-[60] rounded-control bg-accent-bg px-4 py-2 text-accent-on focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-bg lg:block">
        <Sidebar />
      </aside>

      {/* mobile drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}
        />
        <aside
          id="mobile-menu"
          inert={!open}
          className={`absolute inset-y-0 left-0 w-[min(300px,85vw)] border-r border-border bg-bg shadow-soft transition-transform duration-[250ms] ease-out ${open ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="btn-ghost absolute right-3 top-3 !px-0 w-10 justify-center"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
          <Sidebar onNavigate={() => setOpen(false)} />
        </aside>
      </div>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border bg-bg">
          <div className="mx-auto flex h-16 max-w-[1100px] items-center gap-3 px-4 sm:px-6 lg:px-10">
            <button
              ref={menuButton}
              type="button"
              className="btn-ghost !px-0 w-10 justify-center lg:hidden"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen(true)}
            >
              <Menu size={18} />
            </button>
            <div className="lg:hidden">
              <Brand />
            </div>
            <div className="ml-auto w-full max-w-[360px]">
              <SearchBox key={location.pathname === '/search' ? 's' : 'o'} />
            </div>
            <ThemeToggle className="lg:hidden" />
          </div>
        </header>

        <main id="main" tabIndex={-1} className="outline-none">
          <div key={location.pathname} className="page-enter">
            <Outlet />
          </div>
        </main>

        <footer className="mx-auto max-w-[1100px] px-4 pb-12 pt-20 sm:px-6 lg:px-10">
          <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="mono-meta flex flex-wrap items-center gap-x-1">
              <span className="mr-2">© {new Date().getFullYear()} {site.name}</span>
              {[
                ['About', '/about'],
                ['RSS', '/feed.xml'],
                ['Sitemap', '/sitemap.xml'],
              ].map(([label, href]) =>
                href === '/about' ? (
                  <Link key={href} to={href} className="inline-block px-2 py-3 hover:text-text">
                    {label}
                  </Link>
                ) : (
                  <a key={href} href={href} className="inline-block px-2 py-3 hover:text-text">
                    {label}
                  </a>
                ),
              )}
            </p>
            <Socials className="-mx-2" />
          </div>
        </footer>
      </div>
    </div>
  )
}
