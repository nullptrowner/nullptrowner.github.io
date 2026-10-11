import siteJson from '../../content/site.json'
import projectsJson from '../../content/projects.json'

export interface Social {
  id: string
  label: string
  url: string
}
export interface NavItem {
  label: string
  to: string
  icon: string
}
export interface Category {
  id: string
  label: string
}
export interface Project {
  name: string
  description: string
  status: string
  category: string
  stack: string[]
  url?: string
}

export const site = siteJson
export const projects: Project[] = projectsJson

const categoryMap = new Map<string, Category>(site.categories.map((c) => [c.id, c]))
export const categoryLabel = (id: string) => categoryMap.get(id)?.label ?? id
