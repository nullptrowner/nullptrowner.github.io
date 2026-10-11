import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Featured } from '../components/Featured'
import { Icon } from '../components/icons'
import { PostCard } from '../components/PostCard'
import { RightPanel } from '../components/RightPanel'
import { Shell } from '../components/Shell'
import { featuredPosts, posts } from '../lib/posts'
import { useSeo } from '../lib/seo'
import { site } from '../lib/site'

const LATEST_COUNT = 5

export default function Home() {
  useSeo({ path: '/' })
  const latest = posts.slice(0, LATEST_COUNT)
  const links = site.socials.filter((s) => s.id !== 'rss')

  return (
    <Shell aside={<RightPanel />}>
      <section className="mb-16 max-w-[620px]">
        <p className="label mb-3">{site.author.role}</p>
        <h1 className="font-serif text-[38px] font-medium leading-[1.1] tracking-[-0.02em] text-text sm:text-[46px]">
          {site.author.tagline}
        </h1>
        <p className="mt-5 text-[17px] leading-relaxed text-text-2">{site.author.intro}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {links.map((s) => (
            <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="btn-ghost">
              <Icon name={s.id} size={16} /> {s.label}
            </a>
          ))}
          <Link to="/about" className="btn-ghost">
            About me
          </Link>
        </div>
      </section>

      <div className="mb-16">
        <Featured posts={featuredPosts.slice(0, 3)} />
      </div>

      <section aria-labelledby="latest-h">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 id="latest-h" className="label">
            Latest
          </h2>
          <Link to="/writing" className="inline-flex items-center gap-1 text-sm text-accent hover:text-accent-hover">
            All writing <ArrowRight size={14} />
          </Link>
        </div>
        <div className="flex flex-col gap-4">
          {latest.map((p, i) => (
            <PostCard key={p.slug} post={p} index={i} />
          ))}
        </div>
      </section>

      <div className="mt-16 xl:hidden">
        <RightPanel />
      </div>
    </Shell>
  )
}
