import { ArrowLeft, ArrowRight, Check, Link2, ListTree } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { PostMeta } from '../components/PostCard'
import { Shell } from '../components/Shell'
import { TagList } from '../components/Tags'
import { Toc } from '../components/Toc'
import { copyText } from '../lib/clipboard'
import { renderMarkdown } from '../lib/markdown'
import { formatDate, getPost, neighbours } from '../lib/posts'
import { useSeo } from '../lib/seo'
import NotFound from './NotFound'

const FEEDBACK_MS = 1600

function flash(el: HTMLElement, label?: HTMLElement | null, text?: string) {
  el.dataset.done = 'true'
  const prev = label?.textContent
  if (label && text) label.textContent = text
  window.setTimeout(() => {
    delete el.dataset.done
    if (label && prev) label.textContent = prev
  }, FEEDBACK_MS)
}

export default function Post() {
  const { slug = '' } = useParams()
  const post = getPost(slug)
  if (!post) return <NotFound />
  return <PostView key={post.slug} slug={post.slug} />
}

function PostView({ slug }: { slug: string }) {
  const post = getPost(slug)!
  const { hash } = useLocation()
  const { html, toc } = useMemo(() => renderMarkdown(post.body), [post.body])
  const { newer, older } = neighbours(slug)
  const bodyRef = useRef<HTMLDivElement>(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const [tocOpen, setTocOpen] = useState(false)

  useSeo({ title: post.title, description: post.description, path: `/posts/${slug}`, image: post.cover, type: 'article' })

  useEffect(() => {
    if (!hash) return
    document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ block: 'start' })
  }, [hash])

  // One delegated handler for code-copy buttons and heading anchors inside rendered markdown.
  const onBodyClick = async (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    const codeBtn = target.closest<HTMLElement>('[data-copy-code]')
    if (codeBtn) {
      const code = codeBtn.closest('.codeblock')?.querySelector('code')?.textContent ?? ''
      if (await copyText(code)) flash(codeBtn, codeBtn.querySelector('span'), 'Copied')
      return
    }
    const anchor = target.closest<HTMLElement>('[data-anchor]')
    if (anchor) {
      const id = anchor.dataset.anchor!
      const url = `${location.origin}${location.pathname}#${id}`
      history.replaceState(null, '', `#${id}`)
      if (await copyText(url)) flash(anchor)
    }
  }

  const copyLink = async () => {
    if (await copyText(`${location.origin}${location.pathname}`)) {
      setLinkCopied(true)
      window.setTimeout(() => setLinkCopied(false), FEEDBACK_MS)
    }
  }

  return (
    <Shell
      aside={
        toc.length > 0 && (
          <div className="hidden xl:block">
            <h2 className="label mb-3">On this page</h2>
            <Toc items={toc} />
          </div>
        )
      }
    >
      <article className="mx-auto max-w-[700px] xl:mx-0">
        <nav aria-label="Breadcrumb" className="mb-8">
          <Link to="/writing" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors duration-200 hover:text-text">
            <ArrowLeft size={14} /> Writing
          </Link>
        </nav>

        <header className="mb-10">
          <PostMeta post={post} />
          <h1 className="mt-4 font-serif text-[36px] font-medium leading-[1.12] tracking-[-0.02em] text-text sm:text-[46px]">{post.title}</h1>
          <p className="mt-4 font-serif text-[19px] leading-relaxed text-text-2">{post.description}</p>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <TagList tags={post.tags} size="md" />
            <button type="button" className="btn-ghost" onClick={copyLink} aria-live="polite">
              {linkCopied ? <Check size={16} /> : <Link2 size={16} />}
              {linkCopied ? 'Link copied' : 'Copy link'}
            </button>
          </div>
          {post.updated !== post.date && <p className="mono-meta mt-4">Updated {formatDate(post.updated)}</p>}
        </header>

        {toc.length > 0 && (
          <details
            className="mb-10 rounded-card border border-border bg-surface xl:hidden"
            open={tocOpen}
            onToggle={(e) => setTocOpen((e.currentTarget as HTMLDetailsElement).open)}
          >
            <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 text-[15px] text-text-2 [&::-webkit-details-marker]:hidden">
              <ListTree size={16} /> On this page
            </summary>
            <div className="px-4 pb-4">
              <Toc items={toc} onPick={() => setTocOpen(false)} />
            </div>
          </details>
        )}

        {/* clicks are delegated to the real <button>s rendered inside */}
        <div ref={bodyRef} className="prose" onClick={onBodyClick} dangerouslySetInnerHTML={{ __html: html }} />

        <nav aria-label="Previous and next posts" className="mt-20 grid gap-3 sm:grid-cols-2">
          {newer ? (
            <Link to={`/posts/${newer.slug}`} className="group rounded-card border border-border bg-surface p-5 transition-colors duration-200 hover:border-border-strong">
              <span className="label inline-flex items-center gap-1.5">
                <ArrowLeft size={12} /> Newer
              </span>
              <span className="mt-2 block font-serif text-[18px] leading-snug text-text transition-colors group-hover:text-accent">{newer.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {older && (
            <Link to={`/posts/${older.slug}`} className="group rounded-card border border-border bg-surface p-5 text-left transition-colors duration-200 hover:border-border-strong sm:text-right">
              <span className="label inline-flex items-center gap-1.5">
                Older <ArrowRight size={12} />
              </span>
              <span className="mt-2 block font-serif text-[18px] leading-snug text-text transition-colors group-hover:text-accent">{older.title}</span>
            </Link>
          )}
        </nav>
      </article>
    </Shell>
  )
}
