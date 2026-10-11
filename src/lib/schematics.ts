import type { Schematic } from './schematic-types'

const raw = import.meta.glob('../../content/schematics/*.json', { eager: true, import: 'default' }) as Record<
  string,
  Schematic
>

const slugFromPath = (path: string) => path.replace(/^.*\//, '').replace(/\.json$/, '')

export interface PublishedSchematic extends Schematic {
  slug: string
}

export const schematics: PublishedSchematic[] = Object.entries(raw)
  .map(([path, data]) => ({ ...data, slug: slugFromPath(path) }))
  .sort((a, b) => b.date.localeCompare(a.date))

export const getSchematic = (slug: string) => schematics.find((s) => s.slug === slug)
