export interface Post {
  slug: string
  title: string
  description: string
  date: string
  updated: string
  category: string
  tags: string[]
  featured: boolean
  cover?: string
  body: string
  text: string
  minutes: number
}
export function parseFrontmatter(source: string): { data: Record<string, unknown>; body: string }
export function toPlainText(markdown: string): string
export function readingTime(text: string): number
export function slugFromPath(path: string): string
export function buildPost(path: string, source: string): Post
