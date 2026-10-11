import { Icon } from '../components/icons'
import { PageHeader, Shell } from '../components/Shell'
import { useSeo } from '../lib/seo'
import { site } from '../lib/site'

export default function About() {
  useSeo({ title: 'About', description: site.author.intro, path: '/about' })
  return (
    <Shell>
      <div className="max-w-[640px]">
        <PageHeader eyebrow={site.author.role} title={`About ${site.author.name}`} />
        <div className="prose">
          {site.author.about.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <h2>What I write about</h2>
          <ul>
            {site.categories.map((c) => (
              <li key={c.id}>{c.label}</li>
            ))}
          </ul>
        </div>
        <h2 className="label mb-3 mt-14">Elsewhere</h2>
        <ul className="flex flex-col gap-2">
          {site.socials.map((s) => (
            <li key={s.id}>
              <a
                href={s.url}
                {...(/^https?:/.test(s.url) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="flex min-h-12 items-center gap-3 rounded-xl border border-border bg-surface px-4 transition-colors duration-200 hover:border-border-strong hover:bg-surface-2"
              >
                <Icon name={s.id} size={18} className="text-muted" />
                <span className="text-text">{s.label}</span>
                <span className="ml-auto truncate font-mono text-[12px] text-muted">{s.url.replace(/^https?:\/\//, '')}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Shell>
  )
}
