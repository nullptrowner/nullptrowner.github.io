export type NodeShape =
  | 'rect'
  | 'rounded'
  | 'diamond'
  | 'circle'
  | 'hexagon'
  | 'cylinder'
  | 'parallelogram'
  | 'text'
  | 'person'
  | 'company'

export interface SchematicNode {
  id: string
  x: number
  y: number
  w: number
  h: number
  shape: NodeShape
  label: string
}

export interface SchematicEdge {
  id: string
  from: string
  to: string
  label?: string
}

export interface Schematic {
  title: string
  description: string
  date: string
  updated: string
  tags: string[]
  nodes: SchematicNode[]
  edges: SchematicEdge[]
}

export const DEFAULT_SIZE: Record<NodeShape, { w: number; h: number }> = {
  rect: { w: 170, h: 70 },
  rounded: { w: 170, h: 70 },
  diamond: { w: 170, h: 110 },
  circle: { w: 112, h: 112 },
  hexagon: { w: 180, h: 80 },
  cylinder: { w: 140, h: 100 },
  parallelogram: { w: 180, h: 70 },
  text: { w: 150, h: 40 },
  person: { w: 90, h: 120 },
  company: { w: 140, h: 110 },
}

export const SHAPE_LABELS: Record<NodeShape, string> = {
  rect: 'Rectangle',
  rounded: 'Rounded',
  diamond: 'Decision',
  circle: 'Circle',
  hexagon: 'Hexagon',
  cylinder: 'Database',
  parallelogram: 'I/O',
  text: 'Text',
  person: 'Person',
  company: 'Company',
}

export const MIN_NODE_SIZE = { w: 56, h: 36 } as const

/** Fixed colours baked into every exported/published schematic, independent of the site's light/dark toggle — matches the cherry-dark illustrations used elsewhere on the site (public/img/diagram-*.svg). */
export const SCHEMATIC_PALETTE = {
  canvasBg: '#31111A',
  nodeFill: '#3F1620',
  nodeStroke: '#E3B3BF',
  text: '#F5EEF0',
  edgeStroke: '#E3B3BF',
  selected: '#F2CDD6',
} as const

export function emptySchematic(title = 'Untitled schematic'): Schematic {
  const today = new Date().toISOString().slice(0, 10)
  return { title, description: '', date: today, updated: today, tags: [], nodes: [], edges: [] }
}

export function newNodeId(): string {
  return `n${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

export function newEdgeId(): string {
  return `e${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}
