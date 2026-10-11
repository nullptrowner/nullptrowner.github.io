import { useRef } from 'react'
import { canvasSize, edgeLine } from '../lib/schematic-geometry'
import { GRID_SIZE } from '../lib/schematic-svg'
import { MIN_NODE_SIZE, SCHEMATIC_PALETTE as P } from '../lib/schematic-types'
import type { NodeShape, Schematic, SchematicNode } from '../lib/schematic-types'

export type Tool = 'select' | NodeShape | 'connect'
export type Selection = { kind: 'node' | 'edge'; id: string } | null

const CANVAS_MIN_W = 900
const CANVAS_MIN_H = 520
const CANVAS_PADDING = 220
const LINE_HEIGHT = 17
const GRID_STROKE_OPACITY = 0.14
const HANDLE_SIZE = 10
const DELETE_BTN_RADIUS = 9
const ICON_CAPTION_SHAPES = new Set<NodeShape>(['person', 'company'])
const ICON_AREA_RATIO = 0.68

interface Props {
  schematic: Schematic
  tool: Tool
  connectingFrom: string | null
  selected: Selection
  onAddNode: (x: number, y: number) => void
  onMoveNode: (id: string, x: number, y: number) => void
  onResizeNode: (id: string, w: number, h: number) => void
  onSelect: (sel: Selection) => void
  onConnectClick: (nodeId: string) => void
  onDeleteSelected: () => void
}

function shapeElement(n: SchematicNode, stroke: string) {
  const { x, y, w, h, shape } = n
  if (shape === 'rounded') {
    return <rect x={x} y={y} width={w} height={h} rx={14} fill={P.nodeFill} stroke={stroke} strokeWidth={1.5} />
  }
  if (shape === 'diamond') {
    const cx = x + w / 2
    const cy = y + h / 2
    return <polygon points={`${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}`} fill={P.nodeFill} stroke={stroke} strokeWidth={1.5} />
  }
  if (shape === 'circle') {
    return <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} fill={P.nodeFill} stroke={stroke} strokeWidth={1.5} />
  }
  if (shape === 'hexagon') {
    const inset = Math.min(w * 0.16, 28)
    const points = `${x + inset},${y} ${x + w - inset},${y} ${x + w},${y + h / 2} ${x + w - inset},${y + h} ${x + inset},${y + h} ${x},${y + h / 2}`
    return <polygon points={points} fill={P.nodeFill} stroke={stroke} strokeWidth={1.5} />
  }
  if (shape === 'parallelogram') {
    const skew = Math.min(w * 0.2, 24)
    const points = `${x + skew},${y} ${x + w},${y} ${x + w - skew},${y + h} ${x},${y + h}`
    return <polygon points={points} fill={P.nodeFill} stroke={stroke} strokeWidth={1.5} />
  }
  if (shape === 'cylinder') {
    const rx = w / 2
    const ry = Math.min(h * 0.2, 16)
    const cx = x + rx
    return (
      <>
        <path
          d={`M ${x} ${y + ry} L ${x} ${y + h - ry} A ${rx} ${ry} 0 0 0 ${x + w} ${y + h - ry} L ${x + w} ${y + ry}`}
          fill={P.nodeFill}
          stroke={stroke}
          strokeWidth={1.5}
        />
        <ellipse cx={cx} cy={y + ry} rx={rx} ry={ry} fill={P.nodeFill} stroke={stroke} strokeWidth={1.5} />
      </>
    )
  }
  if (shape === 'text') {
    // No visible box, just a transparent hit-area so an empty label can still be selected/dragged.
    return <rect x={x} y={y} width={w} height={h} fill="transparent" stroke={stroke} strokeWidth={stroke === P.nodeStroke ? 0 : 1} strokeDasharray="3 3" />
  }
  if (shape === 'person') return <PersonIcon n={n} stroke={stroke} />
  if (shape === 'company') return <CompanyIcon n={n} stroke={stroke} />
  return <rect x={x} y={y} width={w} height={h} fill={P.nodeFill} stroke={stroke} strokeWidth={1.5} />
}

function PersonIcon({ n, stroke }: { n: SchematicNode; stroke: string }) {
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
  return (
    <g fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round">
      <circle cx={cx} cy={headCy} r={headR} />
      <path d={`M ${cx} ${neckY} L ${cx} ${hipY}`} />
      <path d={`M ${cx - armSpan} ${armY} L ${cx + armSpan} ${armY}`} />
      <path d={`M ${cx} ${hipY} L ${cx - legSpan} ${footY}`} />
      <path d={`M ${cx} ${hipY} L ${cx + legSpan} ${footY}`} />
    </g>
  )
}

function CompanyIcon({ n, stroke }: { n: SchematicNode; stroke: string }) {
  const { x, y, w, h } = n
  const iconH = h * ICON_AREA_RATIO
  const bw = w * 0.6
  const bh = iconH * 0.82
  const bx = x + (w - bw) / 2
  const by = y + iconH - bh
  const windowSize = bw * 0.16
  const cols = [bx + bw * 0.22, bx + bw * 0.5, bx + bw * 0.78]
  const rows = [by + bh * 0.22, by + bh * 0.48]
  const doorW = bw * 0.2
  const doorH = bh * 0.26
  return (
    <g>
      <rect x={bx} y={by} width={bw} height={bh} fill={P.nodeFill} stroke={stroke} strokeWidth={1.5} />
      {cols.flatMap((wx) =>
        rows.map((wy) => <rect key={`${wx}-${wy}`} x={wx - windowSize / 2} y={wy - windowSize / 2} width={windowSize} height={windowSize} fill={P.canvasBg} />),
      )}
      <rect x={bx + bw / 2 - doorW / 2} y={by + bh - doorH} width={doorW} height={doorH} fill={P.canvasBg} />
    </g>
  )
}

function NodeLabel({ n }: { n: SchematicNode }) {
  const lines = n.label.split('\n').filter(Boolean)
  if (lines.length === 0) return null
  const cx = n.x + n.w / 2
  const cy = ICON_CAPTION_SHAPES.has(n.shape) ? n.y + n.h * ICON_AREA_RATIO + (n.h * (1 - ICON_AREA_RATIO)) / 2 : n.y + n.h / 2
  const startY = cy - ((lines.length - 1) * LINE_HEIGHT) / 2
  return (
    <text textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-mono)" fontSize={14} fill={P.text} className="pointer-events-none select-none">
      {lines.map((line, i) => (
        <tspan key={i} x={cx} y={startY + i * LINE_HEIGHT}>
          {line}
        </tspan>
      ))}
    </text>
  )
}

function DeleteButton({ x, y, onClick }: { x: number; y: number; onClick: () => void }) {
  return (
    <g
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className="cursor-pointer"
    >
      <circle cx={x} cy={y} r={DELETE_BTN_RADIUS} fill={P.selected} />
      <path d={`M ${x - 4} ${y - 4} L ${x + 4} ${y + 4} M ${x + 4} ${y - 4} L ${x - 4} ${y + 4}`} stroke={P.canvasBg} strokeWidth={1.5} strokeLinecap="round" />
    </g>
  )
}

export function SchematicCanvas({ schematic, tool, connectingFrom, selected, onAddNode, onMoveNode, onResizeNode, onSelect, onConnectClick, onDeleteSelected }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null)
  const resizeRef = useRef<{ id: string; startW: number; startH: number; startX: number; startY: number } | null>(null)
  const { width, height } = canvasSize(schematic.nodes, CANVAS_MIN_W, CANVAS_MIN_H, CANVAS_PADDING)
  const nodesById = new Map(schematic.nodes.map((n) => [n.id, n]))

  const toSvgPoint = (e: { clientX: number; clientY: number }) => {
    const rect = svgRef.current?.getBoundingClientRect()
    return { x: e.clientX - (rect?.left ?? 0), y: e.clientY - (rect?.top ?? 0) }
  }

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (tool === 'select' || tool === 'connect') {
      onSelect(null)
      return
    }
    const { x, y } = toSvgPoint(e)
    onAddNode(x, y)
  }

  const handleNodePointerDown = (e: React.PointerEvent, node: SchematicNode) => {
    e.stopPropagation()
    if (tool === 'connect') {
      onConnectClick(node.id)
      return
    }
    if (tool !== 'select') return
    onSelect({ kind: 'node', id: node.id })
    const { x, y } = toSvgPoint(e)
    dragRef.current = { id: node.id, offsetX: x - node.x, offsetY: y - node.y }
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }

  const handleNodePointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current
    if (!drag) return
    const { x, y } = toSvgPoint(e)
    onMoveNode(drag.id, Math.max(0, Math.round(x - drag.offsetX)), Math.max(0, Math.round(y - drag.offsetY)))
  }

  const endDrag = (e: React.PointerEvent) => {
    if (dragRef.current) (e.target as Element).releasePointerCapture(e.pointerId)
    dragRef.current = null
  }

  const handleResizePointerDown = (e: React.PointerEvent, node: SchematicNode) => {
    e.stopPropagation()
    const { x, y } = toSvgPoint(e)
    resizeRef.current = { id: node.id, startW: node.w, startH: node.h, startX: x, startY: y }
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }

  const handleResizePointerMove = (e: React.PointerEvent) => {
    const resize = resizeRef.current
    if (!resize) return
    const { x, y } = toSvgPoint(e)
    const w = Math.max(MIN_NODE_SIZE.w, Math.round(resize.startW + (x - resize.startX)))
    const h = Math.max(MIN_NODE_SIZE.h, Math.round(resize.startH + (y - resize.startY)))
    onResizeNode(resize.id, w, h)
  }

  const endResize = (e: React.PointerEvent) => {
    if (resizeRef.current) (e.target as Element).releasePointerCapture(e.pointerId)
    resizeRef.current = null
  }

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="block"
      style={{ cursor: tool === 'select' ? 'default' : 'crosshair' }}
      onClick={handleBackgroundClick}
    >
      <defs>
        <marker id="editor-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill={P.edgeStroke} />
        </marker>
        <pattern id="editor-grid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
          <path d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`} fill="none" stroke={P.edgeStroke} strokeOpacity={GRID_STROKE_OPACITY} strokeWidth={1} />
        </pattern>
      </defs>
      <rect width={width} height={height} fill={P.canvasBg} />
      <rect width={width} height={height} fill="url(#editor-grid)" />

      {schematic.edges.map((edge) => {
        const a = nodesById.get(edge.from)
        const b = nodesById.get(edge.to)
        if (!a || !b) return null
        const { x1, y1, x2, y2 } = edgeLine(a, b)
        const isSelected = selected?.kind === 'edge' && selected.id === edge.id
        const mx = (x1 + x2) / 2
        const my = (y1 + y2) / 2
        return (
          <g
            key={edge.id}
            onClick={(e) => {
              e.stopPropagation()
              if (tool === 'select') onSelect({ kind: 'edge', id: edge.id })
            }}
            style={{ cursor: tool === 'select' ? 'pointer' : undefined }}
          >
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth={14} />
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={isSelected ? P.selected : P.edgeStroke} strokeWidth={isSelected ? 2.5 : 1.5} markerEnd="url(#editor-arrow)" />
            {edge.label && (
              <>
                <rect x={mx - edge.label.length * 3.6 - 4} y={my - 9} width={edge.label.length * 7.2 + 8} height={18} fill={P.canvasBg} />
                <text x={mx} y={my + 4} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={12} fill={P.text} className="pointer-events-none select-none">
                  {edge.label}
                </text>
              </>
            )}
            {isSelected && <DeleteButton x={mx} y={my - 22} onClick={onDeleteSelected} />}
          </g>
        )
      })}

      {schematic.nodes.map((node) => {
        const isSelected = selected?.kind === 'node' && selected.id === node.id
        const isPendingLink = connectingFrom === node.id
        const stroke = isSelected || isPendingLink ? P.selected : P.nodeStroke
        return (
          <g key={node.id}>
            <g
              onPointerDown={(e) => handleNodePointerDown(e, node)}
              onPointerMove={handleNodePointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onClick={(e) => e.stopPropagation()}
              style={{ cursor: tool === 'select' ? 'grab' : tool === 'connect' ? 'pointer' : 'default' }}
            >
              {shapeElement(node, stroke)}
              <NodeLabel n={node} />
            </g>
            {isSelected && tool === 'select' && (
              <>
                <DeleteButton x={node.x + node.w} y={node.y} onClick={onDeleteSelected} />
                <rect
                  x={node.x + node.w - HANDLE_SIZE / 2}
                  y={node.y + node.h - HANDLE_SIZE / 2}
                  width={HANDLE_SIZE}
                  height={HANDLE_SIZE}
                  fill={P.selected}
                  className="cursor-nwse-resize"
                  onPointerDown={(e) => handleResizePointerDown(e, node)}
                  onPointerMove={handleResizePointerMove}
                  onPointerUp={endResize}
                  onPointerCancel={endResize}
                  onClick={(e) => e.stopPropagation()}
                />
              </>
            )}
          </g>
        )
      })}
    </svg>
  )
}
