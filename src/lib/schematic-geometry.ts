import type { NodeShape, SchematicNode } from './schematic-types'

/** Scalar t such that center + (ddx,ddy)*t lands exactly on the shape's border, for a ray pointing toward (ddx,ddy). */
export function boundaryT(shape: NodeShape, ddx: number, ddy: number, w: number, h: number): number {
  if (ddx === 0 && ddy === 0) return 0
  const hw = w / 2
  const hh = h / 2
  if (shape === 'circle') {
    const denom = Math.sqrt((ddx / hw) ** 2 + (ddy / hh) ** 2)
    return denom === 0 ? 0 : 1 / denom
  }
  if (shape === 'diamond') {
    const denom = Math.abs(ddx) / hw + Math.abs(ddy) / hh
    return denom === 0 ? 0 : 1 / denom
  }
  const tx = ddx === 0 ? Infinity : hw / Math.abs(ddx)
  const ty = ddy === 0 ? Infinity : hh / Math.abs(ddy)
  return Math.min(tx, ty)
}

export function center(n: Pick<SchematicNode, 'x' | 'y' | 'w' | 'h'>) {
  return { x: n.x + n.w / 2, y: n.y + n.h / 2 }
}

/** A straight connector between two nodes, clipped to both nodes' borders so arrows stop at the shape edge, not the center. */
export function edgeLine(a: SchematicNode, b: SchematicNode) {
  const ca = center(a)
  const cb = center(b)
  const dx = cb.x - ca.x
  const dy = cb.y - ca.y
  const ta = boundaryT(a.shape, dx, dy, a.w, a.h)
  const tb = boundaryT(b.shape, -dx, -dy, b.w, b.h)
  return {
    x1: ca.x + dx * ta,
    y1: ca.y + dy * ta,
    x2: cb.x - dx * tb,
    y2: cb.y - dy * tb,
  }
}

export function canvasSize(
  nodes: Pick<SchematicNode, 'x' | 'y' | 'w' | 'h'>[],
  minW: number,
  minH: number,
  padding: number,
) {
  const maxX = Math.max(0, ...nodes.map((n) => n.x + n.w))
  const maxY = Math.max(0, ...nodes.map((n) => n.y + n.h))
  return { width: Math.max(minW, maxX + padding), height: Math.max(minH, maxY + padding) }
}
