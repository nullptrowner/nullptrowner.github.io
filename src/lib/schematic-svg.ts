import { canvasSize, edgeLine } from './schematic-geometry'
import { SCHEMATIC_PALETTE as P } from './schematic-types'
import type { Schematic, SchematicNode } from './schematic-types'

const EXPORT_PADDING = 40
const EXPORT_MIN_W = 320
const EXPORT_MIN_H = 200
const LINE_HEIGHT = 17
const LABEL_FONT_SIZE = 14
const EDGE_LABEL_FONT_SIZE = 12
const EDGE_LABEL_CHAR_WIDTH = 7.2
const EDGE_LABEL_PAD_X = 8
const EDGE_LABEL_HEIGHT = 18
export const GRID_SIZE = 40
const GRID_STROKE_OPACITY = 0.14

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function shapeMarkup(n: SchematicNode): string {
  const { x, y, w, h, shape } = n
  if (shape === 'rounded') {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${P.nodeFill}" stroke="${P.nodeStroke}" stroke-width="1.5" />`
  }
  if (shape === 'diamond') {
    const cx = x + w / 2
    const cy = y + h / 2
    return `<polygon points="${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}" fill="${P.nodeFill}" stroke="${P.nodeStroke}" stroke-width="1.5" />`
  }
  if (shape === 'circle') {
    return `<ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${w / 2}" ry="${h / 2}" fill="${P.nodeFill}" stroke="${P.nodeStroke}" stroke-width="1.5" />`
  }
  if (shape === 'hexagon') {
    const inset = Math.min(w * 0.16, 28)
    const points = `${x + inset},${y} ${x + w - inset},${y} ${x + w},${y + h / 2} ${x + w - inset},${y + h} ${x + inset},${y + h} ${x},${y + h / 2}`
    return `<polygon points="${points}" fill="${P.nodeFill}" stroke="${P.nodeStroke}" stroke-width="1.5" />`
  }
  if (shape === 'parallelogram') {
    const skew = Math.min(w * 0.2, 24)
    const points = `${x + skew},${y} ${x + w},${y} ${x + w - skew},${y + h} ${x},${y + h}`
    return `<polygon points="${points}" fill="${P.nodeFill}" stroke="${P.nodeStroke}" stroke-width="1.5" />`
  }
  if (shape === 'cylinder') {
    const rx = w / 2
    const ry = Math.min(h * 0.2, 16)
    const cx = x + rx
    const body = `<path d="M ${x} ${y + ry} L ${x} ${y + h - ry} A ${rx} ${ry} 0 0 0 ${x + w} ${y + h - ry} L ${x + w} ${y + ry}" fill="${P.nodeFill}" stroke="${P.nodeStroke}" stroke-width="1.5" />`
    const top = `<ellipse cx="${cx}" cy="${y + ry}" rx="${rx}" ry="${ry}" fill="${P.nodeFill}" stroke="${P.nodeStroke}" stroke-width="1.5" />`
    return body + top
  }
  if (shape === 'text') return ''
  if (shape === 'person') return personMarkup(n, P.nodeStroke)
  if (shape === 'company') return companyMarkup(n, P.nodeStroke)
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${P.nodeFill}" stroke="${P.nodeStroke}" stroke-width="1.5" />`
}

/** Shapes drawn as an icon in the upper part of the box, with their label captioned below rather than centered over the icon. */
const ICON_CAPTION_SHAPES = new Set<SchematicNode['shape']>(['person', 'company'])
const ICON_AREA_RATIO = 0.68

function personMarkup(n: SchematicNode, stroke: string): string {
  const { x, y, w, h } = n
  const iconH = h * ICON_AREA_RATIO
  const cx = x + w / 2
  const headR = Math.min(w, iconH) * 0.16
  const headCy = y + headR + 4
  const neckY = headCy + headR
  const hipY = y + iconH * 0.62
  const footY = y + iconH * 0.92
  const armY = neckY + (hipY - neckY) * 0.35
  const armSpan = w * 0.22
  const legSpan = w * 0.18
  return [
    `<circle cx="${cx}" cy="${headCy}" r="${headR}" fill="none" stroke="${stroke}" stroke-width="2" />`,
    `<path d="M ${cx} ${neckY} L ${cx} ${hipY}" stroke="${stroke}" stroke-width="2" stroke-linecap="round" />`,
    `<path d="M ${cx - armSpan} ${armY} L ${cx + armSpan} ${armY}" stroke="${stroke}" stroke-width="2" stroke-linecap="round" />`,
    `<path d="M ${cx} ${hipY} L ${cx - legSpan} ${footY}" stroke="${stroke}" stroke-width="2" stroke-linecap="round" />`,
    `<path d="M ${cx} ${hipY} L ${cx + legSpan} ${footY}" stroke="${stroke}" stroke-width="2" stroke-linecap="round" />`,
  ].join('')
}

function companyMarkup(n: SchematicNode, stroke: string): string {
  const { x, y, w, h } = n
  const iconH = h * ICON_AREA_RATIO
  const bw = w * 0.6
  const bh = iconH * 0.82
  const bx = x + (w - bw) / 2
  const by = y + iconH - bh
  const windowSize = bw * 0.16
  const cols = [bx + bw * 0.22, bx + bw * 0.5, bx + bw * 0.78]
  const rows = [by + bh * 0.22, by + bh * 0.48]
  const windows = cols
    .flatMap((wx) => rows.map((wy) => `<rect x="${wx - windowSize / 2}" y="${wy - windowSize / 2}" width="${windowSize}" height="${windowSize}" fill="${P.canvasBg}" />`))
    .join('')
  const doorW = bw * 0.2
  const door = `<rect x="${bx + bw / 2 - doorW / 2}" y="${by + bh - bh * 0.26}" width="${doorW}" height="${bh * 0.26}" fill="${P.canvasBg}" />`
  return `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="${P.nodeFill}" stroke="${stroke}" stroke-width="1.5" />${windows}${door}`
}

function labelMarkup(n: SchematicNode): string {
  const lines = n.label.split('\n').filter(Boolean)
  if (lines.length === 0) return ''
  const cx = n.x + n.w / 2
  const cy = ICON_CAPTION_SHAPES.has(n.shape) ? n.y + n.h * ICON_AREA_RATIO + (n.h * (1 - ICON_AREA_RATIO)) / 2 : n.y + n.h / 2
  const startY = cy - ((lines.length - 1) * LINE_HEIGHT) / 2
  const tspans = lines
    .map((line, i) => `<tspan x="${cx}" y="${startY + i * LINE_HEIGHT}">${escapeXml(line)}</tspan>`)
    .join('')
  return `<text text-anchor="middle" dominant-baseline="middle" font-family="ui-monospace,Menlo,monospace" font-size="${LABEL_FONT_SIZE}" fill="${P.text}">${tspans}</text>`
}

function edgeMarkup(schematic: Schematic, nodesById: Map<string, SchematicNode>): string {
  return schematic.edges
    .map((e) => {
      const a = nodesById.get(e.from)
      const b = nodesById.get(e.to)
      if (!a || !b) return ''
      const { x1, y1, x2, y2 } = edgeLine(a, b)
      const line = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${P.edgeStroke}" stroke-width="1.5" marker-end="url(#arrow)" />`
      if (!e.label) return line
      const mx = (x1 + x2) / 2
      const my = (y1 + y2) / 2
      const w = e.label.length * EDGE_LABEL_CHAR_WIDTH + EDGE_LABEL_PAD_X
      const bg = `<rect x="${mx - w / 2}" y="${my - EDGE_LABEL_HEIGHT / 2}" width="${w}" height="${EDGE_LABEL_HEIGHT}" fill="${P.canvasBg}" />`
      const text = `<text x="${mx}" y="${my + 4}" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-size="${EDGE_LABEL_FONT_SIZE}" fill="${P.text}">${escapeXml(e.label)}</text>`
      return line + bg + text
    })
    .join('')
}

/** A standalone, self-contained SVG document string: used for the export button, the gallery thumbnails and the detail-page view, so what you export is exactly what the site shows. */
export function renderStaticSvg(schematic: Schematic): string {
  const nodesById = new Map(schematic.nodes.map((n) => [n.id, n]))
  const { width, height } = canvasSize(schematic.nodes, EXPORT_MIN_W, EXPORT_MIN_H, EXPORT_PADDING)

  const edges = edgeMarkup(schematic, nodesById)
  const nodes = schematic.nodes.map((n) => `${shapeMarkup(n)}${labelMarkup(n)}`).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0L10 5L0 10z" fill="${P.edgeStroke}" />
    </marker>
    <pattern id="grid" width="${GRID_SIZE}" height="${GRID_SIZE}" patternUnits="userSpaceOnUse">
      <path d="M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}" fill="none" stroke="${P.edgeStroke}" stroke-opacity="${GRID_STROKE_OPACITY}" stroke-width="1" />
    </pattern>
  </defs>
  <rect width="${width}" height="${height}" fill="${P.canvasBg}" />
  <rect width="${width}" height="${height}" fill="url(#grid)" />
  ${edges}
  ${nodes}
</svg>`
}
