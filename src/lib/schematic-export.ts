import { renderStaticSvg } from './schematic-svg'
import type { Schematic } from './schematic-types'

const PNG_SCALE = 2

function download(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function slugify(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
  return slug || 'schematic'
}

export function exportJson(schematic: Schematic) {
  download(`${slugify(schematic.title)}.json`, new Blob([JSON.stringify(schematic, null, 2)], { type: 'application/json' }))
}

export function exportSvg(schematic: Schematic) {
  download(`${slugify(schematic.title)}.svg`, new Blob([renderStaticSvg(schematic)], { type: 'image/svg+xml' }))
}

export async function exportPng(schematic: Schematic): Promise<void> {
  const svgBlob = new Blob([renderStaticSvg(schematic)], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(svgBlob)
  try {
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Could not rasterize the diagram'))
      img.src = url
    })
    const canvas = document.createElement('canvas')
    canvas.width = img.width * PNG_SCALE
    canvas.height = img.height * PNG_SCALE
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D is not supported in this browser')
    ctx.scale(PNG_SCALE, PNG_SCALE)
    ctx.drawImage(img, 0, 0)
    const pngBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!pngBlob) throw new Error('PNG export failed')
    download(`${slugify(schematic.title)}.png`, pngBlob)
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function exportMarkdown(schematic: Schematic) {
  const slug = slugify(schematic.title)
  const byId = new Map(schematic.nodes.map((n) => [n.id, n.label.replace(/\n/g, ' ')]))
  const lines = [
    `# ${schematic.title}`,
    '',
    schematic.description,
    '',
    `![${schematic.title}](/img/${slug}.svg)`,
    '',
    '## Nodes',
    '',
    ...schematic.nodes.map((n) => `- **${n.label.replace(/\n/g, ' ')}** (${n.shape})`),
    '',
    '## Connections',
    '',
    ...schematic.edges.map((e) => {
      const from = byId.get(e.from) ?? e.from
      const to = byId.get(e.to) ?? e.to
      return `- ${from} → ${to}${e.label ? ` (${e.label})` : ''}`
    }),
    '',
  ]
  download(`${slug}.md`, new Blob([lines.join('\n')], { type: 'text/markdown' }))
}
