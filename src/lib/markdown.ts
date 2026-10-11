import { Marked, type Tokens } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import diff from 'highlight.js/lib/languages/diff'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import go from 'highlight.js/lib/languages/go'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import python from 'highlight.js/lib/languages/python'
import rust from 'highlight.js/lib/languages/rust'
import sql from 'highlight.js/lib/languages/sql'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'

const languages = { bash, css, diff, dockerfile, go, javascript, json, python, rust, sql, typescript, xml, yaml }
for (const [name, def] of Object.entries(languages)) hljs.registerLanguage(name, def)
const aliases: Record<string, string> = { sh: 'bash', shell: 'bash', zsh: 'bash', js: 'javascript', ts: 'typescript', tsx: 'typescript', jsx: 'javascript', html: 'xml', yml: 'yaml', py: 'python', docker: 'dockerfile' }
for (const [alias, name] of Object.entries(aliases)) hljs.registerAliases(alias, { languageName: name })

export interface TocItem {
  id: string
  text: string
  depth: 2 | 3
}

export interface RenderedPost {
  html: string
  toc: TocItem[]
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const TABLE_DELIMITER_LINE = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/
const PLACEHOLDER_HEADER_CELL = '​' // zero-width space: renders as an empty header, but is non-empty so marked's lexer accepts the row.

/**
 * Chirpy/kramdown accepts a table whose first line is the delimiter row with no header text above it.
 * The GFM parser marked uses does not, and silently falls back to a plain paragraph. Detect that shape
 * and insert a synthetic header row so the table parses; table() below hides the header when every
 * cell is just the placeholder.
 */
function supplyMissingTableHeaders(markdown: string): string {
  const lines = markdown.split('\n')
  const out: string[] = []
  for (const line of lines) {
    const prev = out[out.length - 1]
    const isTableStart = (prev === undefined || prev.trim() === '') && TABLE_DELIMITER_LINE.test(line) && line.includes('-')
    if (isTableStart) {
      const columns = line
        .split('|')
        .map((c) => c.trim())
        .filter((c, idx, arr) => !((idx === 0 || idx === arr.length - 1) && c === ''))
      out.push(`|${columns.map(() => PLACEHOLDER_HEADER_CELL).join('|')}|`)
    }
    out.push(line)
  }
  return out.join('\n')
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')

const COPY_ICON =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>'
const LINK_ICON =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>'

export function renderMarkdown(source: string): RenderedPost {
  const toc: TocItem[] = []
  const used = new Map<string, number>()
  const marked = new Marked(
    markedHighlight({
      emptyLangClass: 'hljs',
      langPrefix: 'hljs language-',
      highlight(code, lang) {
        const language = lang && hljs.getLanguage(lang) ? lang : null
        return language ? hljs.highlight(code, { language }).value : escapeHtml(code)
      },
    }),
  )

  marked.use({
    renderer: {
      heading({ tokens, depth }: Tokens.Heading) {
        const inner = this.parser.parseInline(tokens)
        if (depth === 1) return `<h2>${inner}</h2>`
        const base = slugify(inner) || 'section'
        const n = used.get(base) ?? 0
        used.set(base, n + 1)
        const id = n === 0 ? base : `${base}-${n}`
        if (depth <= 3) toc.push({ id, text: inner.replace(/<[^>]+>/g, ''), depth: depth as 2 | 3 })
        return `<h${depth} id="${id}">${inner}<button type="button" class="anchor" data-anchor="${id}" aria-label="Copy link to this section">${LINK_ICON}</button></h${depth}>`
      },
      code({ text, lang, escaped }: Tokens.Code) {
        const language = (lang ?? '').split(/\s/)[0]
        const body = escaped ? text : hljs.getLanguage(language) ? hljs.highlight(text, { language }).value : escapeHtml(text)
        return `<div class="codeblock"><div class="codeblock-head"><span>${escapeHtml(language || 'text')}</span><button type="button" class="codeblock-copy" data-copy-code aria-label="Copy code">${COPY_ICON}<span>Copy</span></button></div><pre><code class="hljs">${body}</code></pre></div>`
      },
      table(token: Tokens.Table) {
        const headerCells = token.header.map((c) => this.parser.parseInline(c.tokens))
        const hasHeader = headerCells.some((c) => c.replace(PLACEHOLDER_HEADER_CELL, '').trim() !== '')
        const thead = hasHeader ? `<thead><tr>${headerCells.map((c) => `<th>${c}</th>`).join('')}</tr></thead>` : ''
        const rows = token.rows
          .map((r) => `<tr>${r.map((c) => `<td>${this.parser.parseInline(c.tokens)}</td>`).join('')}</tr>`)
          .join('')
        return `<div class="table-wrap"><table>${thead}<tbody>${rows}</tbody></table></div>`
      },
      image({ href, title, text }: Tokens.Image) {
        const caption = title ? `<figcaption>${escapeHtml(title)}</figcaption>` : ''
        return `<figure><img src="${escapeHtml(href)}" alt="${escapeHtml(text)}" loading="lazy" decoding="async" />${caption}</figure>`
      },
      link({ href, title, tokens }: Tokens.Link) {
        const external = /^https?:\/\//.test(href)
        const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : ''
        const t = title ? ` title="${escapeHtml(title)}"` : ''
        return `<a href="${escapeHtml(href)}"${t}${attrs}>${this.parser.parseInline(tokens)}</a>`
      },
    },
  })

  // marked wraps a lone image in <p>; unwrap so <figure> stays valid.
  const html = (marked.parse(supplyMissingTableHeaders(source), { async: false }) as string).replace(
    /<p>(<figure>[\s\S]*?<\/figure>)<\/p>/g,
    '$1',
  )
  return { html, toc }
}
