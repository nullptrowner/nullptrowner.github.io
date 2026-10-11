import { useEffect } from 'react'
import { site } from './site'

interface SeoInput {
  title?: string
  description?: string
  path: string
  image?: string
  type?: 'website' | 'article'
}

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

export const absoluteUrl = (path: string) => new URL(path, site.url).toString()

export function useSeo({ title, description = site.description, path, image, type = 'website' }: SeoInput) {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${site.name}` : site.title
    const url = absoluteUrl(path)
    document.title = fullTitle
    setMeta('meta[name="description"]', 'name', 'description', description)
    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle)
    setMeta('meta[property="og:description"]', 'property', 'og:description', description)
    setMeta('meta[property="og:url"]', 'property', 'og:url', url)
    setMeta('meta[property="og:type"]', 'property', 'og:type', type)
    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', image ? 'summary_large_image' : 'summary')
    if (image) setMeta('meta[property="og:image"]', 'property', 'og:image', absoluteUrl(image))
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = url
  }, [title, description, path, image, type])
}
