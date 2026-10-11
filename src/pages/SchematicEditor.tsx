import { Building2, Circle, Database, Diamond, Download, FileImage, FileJson, FileText, Hexagon, Link2, MousePointer2, RectangleHorizontal, Square, Trash2, Type, User, type LucideProps } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ComponentType } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageHeader, Shell } from '../components/Shell'
import { SchematicCanvas, type Selection, type Tool } from '../components/SchematicCanvas'
import { exportJson, exportMarkdown, exportPng, exportSvg } from '../lib/schematic-export'
import { canvasSize } from '../lib/schematic-geometry'
import { createDraftId, deleteDraft, loadDraft, saveDraft } from '../lib/schematic-store'
import { DEFAULT_SIZE, emptySchematic, newEdgeId, newNodeId, type Schematic } from '../lib/schematic-types'
import { useSeo } from '../lib/seo'

const ParallelogramIcon = (p: LucideProps) => (
  <svg width={p.size ?? 14} height={p.size ?? 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 4h13l-5 16H3z" />
  </svg>
)

const TOOLS: { id: Tool; label: string; icon: ComponentType<LucideProps> }[] = [
  { id: 'select', label: 'Select / move', icon: MousePointer2 },
  { id: 'rect', label: 'Rectangle', icon: Square },
  { id: 'rounded', label: 'Rounded', icon: RectangleHorizontal },
  { id: 'diamond', label: 'Decision', icon: Diamond },
  { id: 'circle', label: 'Circle', icon: Circle },
  { id: 'hexagon', label: 'Hexagon', icon: Hexagon },
  { id: 'cylinder', label: 'Database', icon: Database },
  { id: 'parallelogram', label: 'I/O', icon: ParallelogramIcon },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'person', label: 'Person', icon: User },
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'connect', label: 'Connect', icon: Link2 },
]

export default function SchematicEditor() {
  const { draftId } = useParams()

  if (!draftId) return <NewDraftRedirect />
  return <Editor key={draftId} draftId={draftId} />
}

function NewDraftRedirect() {
  const navigate = useNavigate()
  useEffect(() => {
    const id = createDraftId()
    saveDraft(id, emptySchematic())
    navigate(`/schematics/draft/${id}`, { replace: true })
  }, [navigate])
  return null
}

function Editor({ draftId }: { draftId: string }) {
  const navigate = useNavigate()
  const [schematic, setSchematic] = useState<Schematic | null>(() => loadDraft(draftId) ?? null)
  const [tool, setTool] = useState<Tool>('select')
  const [selected, setSelected] = useState<Selection>(null)
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null)
  const tagsInputRef = useRef<HTMLInputElement>(null)

  useSeo({ title: schematic?.title || 'Schematic editor', description: 'Draft a block diagram.', path: `/schematics/draft/${draftId}` })

  const update = (fn: (s: Schematic) => Schematic) =>
    setSchematic((prev) => (prev ? fn({ ...prev, updated: new Date().toISOString().slice(0, 10) }) : prev))

  const addNode = (x: number, y: number) => {
    const shape = tool === 'select' || tool === 'connect' ? 'rect' : tool
    const size = DEFAULT_SIZE[shape]
    const id = newNodeId()
    update((s) => ({
      ...s,
      nodes: [...s.nodes, { id, x: Math.max(0, x - size.w / 2), y: Math.max(0, y - size.h / 2), w: size.w, h: size.h, shape, label: 'Label' }],
    }))
    setSelected({ kind: 'node', id })
    setTool('select')
  }

  const moveNode = (id: string, x: number, y: number) => {
    update((s) => ({ ...s, nodes: s.nodes.map((n) => (n.id === id ? { ...n, x, y } : n)) }))
  }

  const resizeNode = (id: string, w: number, h: number) => {
    update((s) => ({ ...s, nodes: s.nodes.map((n) => (n.id === id ? { ...n, w, h } : n)) }))
  }

  const connectClick = (nodeId: string) => {
    if (!connectingFrom) {
      setConnectingFrom(nodeId)
      return
    }
    if (connectingFrom === nodeId) {
      setConnectingFrom(null)
      return
    }
    const id = newEdgeId()
    update((s) => ({ ...s, edges: [...s.edges, { id, from: connectingFrom, to: nodeId }] }))
    setConnectingFrom(null)
    setSelected({ kind: 'edge', id })
  }

  const removeSelected = () => {
    if (!selected) return
    update((s) =>
      selected.kind === 'node'
        ? { ...s, nodes: s.nodes.filter((n) => n.id !== selected.id), edges: s.edges.filter((e) => e.from !== selected.id && e.to !== selected.id) }
        : { ...s, edges: s.edges.filter((e) => e.id !== selected.id) },
    )
    setSelected(null)
  }

  // Persist on every change. Drafts live only in this browser's localStorage until exported.
  useEffect(() => {
    if (schematic) saveDraft(draftId, schematic)
  }, [draftId, schematic])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const typing = /^(INPUT|TEXTAREA)$/.test((e.target as HTMLElement).tagName)
      if (typing || !selected) return
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        removeSelected()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- removeSelected closes over current state intentionally re-created each render
  }, [selected])

  if (!schematic) {
    return (
      <Shell>
        <PageHeader eyebrow="Schematics" title="Draft not found">
          This draft only exists in the browser it was created in. It may have been cleared, or you're on a different device.
        </PageHeader>
        <Link to="/schematics" className="btn-ghost">
          Back to schematics
        </Link>
      </Shell>
    )
  }

  const selectedNode = selected?.kind === 'node' ? schematic.nodes.find((n) => n.id === selected.id) : undefined
  const selectedEdge = selected?.kind === 'edge' ? schematic.edges.find((e) => e.id === selected.id) : undefined
  const { width: scrollW } = canvasSize(schematic.nodes, 900, 520, 220)

  return (
    <Shell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="label mb-2">Schematic draft · stored in this browser only</p>
          <input
            value={schematic.title}
            onChange={(e) => update((s) => ({ ...s, title: e.target.value }))}
            placeholder="Untitled schematic"
            className="w-full max-w-[520px] bg-transparent font-serif text-[28px] font-medium tracking-[-0.01em] text-text outline-none placeholder:text-muted sm:text-[34px]"
          />
        </div>
        <Link to="/schematics" className="btn-ghost shrink-0">
          Back to schematics
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-1.5" role="toolbar" aria-label="Shapes">
            {TOOLS.map(({ id, label, icon: ToolIcon }) => (
              <button
                key={id}
                type="button"
                className="chip gap-1.5"
                aria-pressed={tool === id}
                onClick={() => {
                  setTool(id)
                  setConnectingFrom(null)
                  if (id !== 'select') setSelected(null)
                }}
                title={label}
              >
                <ToolIcon size={14} />
                {label}
              </button>
            ))}
            {connectingFrom && <span className="mono-meta">Click a second node to link it…</span>}
          </div>

          <div className="overflow-auto rounded-card border border-border" style={{ maxWidth: '100%' }}>
            <SchematicCanvas
              schematic={schematic}
              tool={tool}
              connectingFrom={connectingFrom}
              selected={selected}
              onAddNode={addNode}
              onMoveNode={moveNode}
              onResizeNode={resizeNode}
              onSelect={setSelected}
              onConnectClick={connectClick}
              onDeleteSelected={removeSelected}
            />
          </div>
          <p className="mono-meta mt-2">
            {schematic.nodes.length} node{schematic.nodes.length === 1 ? '' : 's'} · {schematic.edges.length} connection
            {schematic.edges.length === 1 ? '' : 's'} · canvas {scrollW}px wide — scroll if it runs off-screen
          </p>
        </div>

        <aside className="flex flex-col gap-6">
          <section>
            <h2 className="label mb-2">Description</h2>
            <textarea
              value={schematic.description}
              onChange={(e) => update((s) => ({ ...s, description: e.target.value }))}
              rows={3}
              placeholder="One or two sentences for the gallery card."
              className="w-full resize-none rounded-control border border-border bg-surface p-2.5 text-[14px] text-text outline-none placeholder:text-muted focus:border-accent"
            />
          </section>

          <section>
            <h2 className="label mb-2">Tags</h2>
            <input
              ref={tagsInputRef}
              defaultValue={schematic.tags.join(', ')}
              onBlur={(e) =>
                update((s) => ({
                  ...s,
                  tags: e.target.value
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean),
                }))
              }
              placeholder="architecture, auth, cli"
              className="w-full rounded-control border border-border bg-surface px-2.5 py-2 text-[14px] text-text outline-none placeholder:text-muted focus:border-accent"
            />
          </section>

          {(selectedNode || selectedEdge) && (
            <section className="rounded-card border border-border bg-surface p-3">
              <h2 className="label mb-2">{selectedNode ? 'Selected node' : 'Selected connection'}</h2>
              {selectedNode && (
                <textarea
                  value={selectedNode.label}
                  onChange={(e) => update((s) => ({ ...s, nodes: s.nodes.map((n) => (n.id === selectedNode.id ? { ...n, label: e.target.value } : n)) }))}
                  rows={2}
                  className="w-full resize-none rounded-control border border-border bg-bg p-2 text-[14px] text-text outline-none focus:border-accent"
                />
              )}
              {selectedEdge && (
                <input
                  value={selectedEdge.label ?? ''}
                  onChange={(e) => update((s) => ({ ...s, edges: s.edges.map((ed) => (ed.id === selectedEdge.id ? { ...ed, label: e.target.value } : ed)) }))}
                  placeholder="Label (optional)"
                  className="w-full rounded-control border border-border bg-bg px-2.5 py-2 text-[14px] text-text outline-none placeholder:text-muted focus:border-accent"
                />
              )}
              <button type="button" onClick={removeSelected} className="btn-ghost mt-2.5 w-full !text-[13px]">
                <Trash2 size={14} /> Delete
              </button>
            </section>
          )}

          <section>
            <h2 className="label mb-2">Export</h2>
            <div className="flex flex-col gap-1.5">
              <button type="button" className="btn-ghost justify-start" onClick={() => exportJson(schematic)}>
                <FileJson size={15} /> Download .json
              </button>
              <button type="button" className="btn-ghost justify-start" onClick={() => exportSvg(schematic)}>
                <Download size={15} /> Download .svg
              </button>
              <button type="button" className="btn-ghost justify-start" onClick={() => void exportPng(schematic)}>
                <FileImage size={15} /> Download .png
              </button>
              <button type="button" className="btn-ghost justify-start" onClick={() => exportMarkdown(schematic)}>
                <FileText size={15} /> Download .md
              </button>
            </div>
            <p className="mono-meta mt-2.5 leading-relaxed">
              To publish, commit the .json to <code className="rounded bg-surface-2 px-1 py-0.5">content/schematics/</code>.
            </p>
          </section>

          <button
            type="button"
            className="btn-ghost justify-start !border-dashed text-[13px] text-muted hover:text-text"
            onClick={() => {
              deleteDraft(draftId)
              navigate('/schematics')
            }}
          >
            <Trash2 size={14} /> Delete this draft
          </button>
        </aside>
      </div>
    </Shell>
  )
}
