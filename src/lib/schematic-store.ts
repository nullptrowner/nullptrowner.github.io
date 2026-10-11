import { type Schematic } from './schematic-types'

const DRAFT_PREFIX = 'nullptr:schematic-draft:'
const INDEX_KEY = 'nullptr:schematic-drafts'

export interface DraftMeta {
  id: string
  title: string
  updated: string
}

function readIndex(): DraftMeta[] {
  try {
    const raw = localStorage.getItem(INDEX_KEY)
    return raw ? (JSON.parse(raw) as DraftMeta[]) : []
  } catch {
    return []
  }
}

function writeIndex(list: DraftMeta[]) {
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(list))
  } catch {
    /* storage unavailable: the index just won't persist across reloads */
  }
}

export function listDrafts(): DraftMeta[] {
  return readIndex().sort((a, b) => b.updated.localeCompare(a.updated))
}

export function loadDraft(id: string): Schematic | undefined {
  try {
    const raw = localStorage.getItem(DRAFT_PREFIX + id)
    return raw ? (JSON.parse(raw) as Schematic) : undefined
  } catch {
    return undefined
  }
}

export function saveDraft(id: string, schematic: Schematic) {
  try {
    localStorage.setItem(DRAFT_PREFIX + id, JSON.stringify(schematic))
    const index = readIndex().filter((d) => d.id !== id)
    index.push({ id, title: schematic.title || 'Untitled schematic', updated: schematic.updated })
    writeIndex(index)
  } catch {
    /* storage unavailable: edits stay in memory for this page view only */
  }
}

export function deleteDraft(id: string) {
  try {
    localStorage.removeItem(DRAFT_PREFIX + id)
    writeIndex(readIndex().filter((d) => d.id !== id))
  } catch {
    /* storage unavailable: nothing to clean up */
  }
}

export function createDraftId(): string {
  return typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `d${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`
}
