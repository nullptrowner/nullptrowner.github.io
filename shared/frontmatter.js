// Minimal frontmatter + post helpers shared by the app and the build scripts.

const WORDS_PER_MINUTE = 200

function parseValue(raw) {
  const v = raw.trim()
  if (v.startsWith('[') && v.endsWith(']')) {
    return v
      .slice(1, -1)
      .split(',')
      .map((s) => parseValue(s))
      .filter((s) => s !== '')
  }
  if (v === 'true') return true
  if (v === 'false') return false
  if (/^(".*"|'.*')$/.test(v)) return v.slice(1, -1)
  return v
}

export function parseFrontmatter(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(source)
  if (!match) return { data: {}, body: source }
  const data = {}
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':')
    if (idx === -1 || line.trim().startsWith('#')) continue
    data[line.slice(0, idx).trim()] = parseValue(line.slice(idx + 1))
  }
  return { data, body: match[2] }
}

export function toPlainText(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/^```.*$/gm, ' '))
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_`>|~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function readingTime(text) {
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}

export function slugFromPath(path) {
  return path.replace(/^.*\//, '').replace(/\.md$/, '')
}

export function buildPost(path, source) {
  const { data, body } = parseFrontmatter(source)
  const text = toPlainText(body)
  return {
    slug: slugFromPath(path),
    title: String(data.title ?? slugFromPath(path)),
    description: String(data.description ?? ''),
    date: String(data.date ?? ''),
    updated: String(data.updated ?? data.date ?? ''),
    category: String(data.category ?? 'notes'),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    featured: data.featured === true,
    cover: data.cover ? String(data.cover) : undefined,
    body,
    text,
    minutes: readingTime(text),
  }
}
