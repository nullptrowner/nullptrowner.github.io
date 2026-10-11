import type { ReactNode } from 'react'

export function Shell({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mx-auto max-w-[1100px] px-4 pt-10 sm:px-6 sm:pt-14 lg:px-10">
      <div className={aside ? 'grid gap-14 xl:grid-cols-[minmax(0,1fr)_272px]' : ''}>
        <div className="min-w-0">{children}</div>
        {aside && (
          <aside className="xl:sticky xl:top-24 xl:self-start" aria-label="Sidebar">
            {aside}
          </aside>
        )}
      </div>
    </div>
  )
}

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <header className="mb-10 max-w-[640px]">
      {eyebrow && <p className="label mb-3">{eyebrow}</p>}
      <h1 className="font-serif text-[34px] font-medium leading-[1.12] tracking-[-0.015em] text-text sm:text-[42px]">{title}</h1>
      {children && <div className="mt-4 text-[17px] leading-relaxed text-text-2">{children}</div>}
    </header>
  )
}
