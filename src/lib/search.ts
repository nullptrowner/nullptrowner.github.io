import { posts, type Post } from './posts'

export interface SearchHit {
  post: Post
  score: number
  snippet: string
}

const WEIGHTS = { title: 10, tag: 6, description: 4, text: 1 }
const SNIPPET_RADIUS = 80

const normalize = (s: string) => s.toLowerCase()

function snippetFor(text: string, terms: string[]) {
  const lower = normalize(text)
  const idx = terms.map((t) => lower.indexOf(t)).filter((i) => i >= 0).sort((a, b) => a - b)[0]
  if (idx === undefined) return ''
  const start = Math.max(0, idx - SNIPPET_RADIUS)
  const end = Math.min(text.length, idx + SNIPPET_RADIUS)
  return `${start > 0 ? '…' : ''}${text.slice(start, end).trim()}${end < text.length ? '…' : ''}`
}

export function search(query: string): SearchHit[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  if (terms.length === 0) return []
  const hits: SearchHit[] = []
  for (const post of posts) {
    const fields = {
      title: normalize(post.title),
      tag: normalize(post.tags.join(' ')),
      description: normalize(post.description),
      text: normalize(post.text),
    }
    let score = 0
    let matchedAll = true
    for (const term of terms) {
      let termScore = 0
      for (const key of Object.keys(WEIGHTS) as (keyof typeof WEIGHTS)[]) {
        if (fields[key].includes(term)) termScore += WEIGHTS[key]
      }
      if (termScore === 0) {
        matchedAll = false
        break
      }
      score += termScore
    }
    if (matchedAll) hits.push({ post, score, snippet: snippetFor(post.text, terms) })
  }
  return hits.sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date))
}
