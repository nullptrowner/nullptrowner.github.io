// Generates sitemap.xml, robots.txt, feed.xml, 404.html and per-route HTML with correct SEO tags.
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildPost } from '../shared/frontmatter.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const site = JSON.parse(await readFile(join(root, 'content/site.json'), 'utf8'))
const base = site.url.replace(/\/$/, '')

const postsDir = join(root, 'content/posts')
const posts = (await Promise.all((await readdir(postsDir)).filter((f) => f.endsWith('.md')).map(async (f) => buildPost(f, await readFile(join(postsDir, f), 'utf8')))))
  .sort((a, b) => b.date.localeCompare(a.date))

const schematicsDir = join(root, 'content/schematics')
const schematics = (
  await Promise.all(
    (await readdir(schematicsDir))
      .filter((f) => f.endsWith('.json'))
      .map(async (f) => ({ ...JSON.parse(await readFile(join(schematicsDir, f), 'utf8')), slug: f.replace(/\.json$/, '') })),
  )
).sort((a, b) => b.date.localeCompare(a.date))

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const staticRoutes = [
  { path: '/', title: site.title, description: site.description },
  { path: '/writing', title: `Writing · ${site.name}`, description: 'All posts: engineering notes, projects and experiments.' },
  { path: '/projects', title: `Projects · ${site.name}`, description: 'Open-source work, tools and experiments.' },
  { path: '/schematics', title: `Schematics · ${site.name}`, description: 'Block diagrams and system sketches, drawn and exported from the in-browser editor.' },
  { path: '/tags', title: `Tags · ${site.name}`, description: 'Browse all posts by tag.' },
  { path: '/about', title: `About · ${site.name}`, description: site.author.intro },
  { path: '/search', title: `Search · ${site.name}`, description: 'Search all posts.' },
]
const postRoutes = posts.map((p) => ({
  path: `/posts/${p.slug}`,
  title: `${p.title} · ${site.name}`,
  description: p.description,
  type: 'article',
  image: p.cover,
}))
const schematicRoutes = schematics.map((s) => ({
  path: `/schematics/${s.slug}`,
  title: `${s.title} · ${site.name}`,
  description: s.description,
  type: 'article',
}))

const template = await readFile(join(dist, 'index.html'), 'utf8')

function seoBlock({ path, title, description, type = 'website', image }) {
  const url = `${base}${path === '/' ? '/' : path}`
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:site_name" content="${esc(site.name)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    image ? `<meta property="og:image" content="${base}${image}" />` : '',
    `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />`,
  ]
    .filter(Boolean)
    .join('\n    ')
}

const withSeo = (route) => template.replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, `<!--seo:start-->\n    ${seoBlock(route)}\n    <!--seo:end-->`)

for (const route of [...staticRoutes, ...postRoutes, ...schematicRoutes]) {
  const html = withSeo(route)
  if (route.path === '/') await writeFile(join(dist, 'index.html'), html)
  else {
    await mkdir(join(dist, route.path), { recursive: true })
    await writeFile(join(dist, route.path, 'index.html'), html)
  }
}
await writeFile(join(dist, '404.html'), template.replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, `<!--seo:start-->\n    <title>404 · ${esc(site.name)}</title>\n    <meta name="robots" content="noindex" />\n    <!--seo:end-->`))

const tags = [...new Set(posts.flatMap((p) => p.tags.map((t) => t.toLowerCase())))]
const urls = [
  ...staticRoutes.filter((r) => r.path !== '/search').map((r) => ({ loc: r.path, lastmod: posts[0]?.updated })),
  ...posts.map((p) => ({ loc: `/posts/${p.slug}`, lastmod: p.updated })),
  ...tags.map((t) => ({ loc: `/tags/${encodeURIComponent(t)}` })),
  ...schematics.map((s) => ({ loc: `/schematics/${s.slug}`, lastmod: s.updated })),
]
await writeFile(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${base}${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`)
    .join('\n')}\n</urlset>\n`,
)
await writeFile(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`)

const rfc822 = (iso) => new Date(`${iso}T00:00:00Z`).toUTCString()
await writeFile(
  join(dist, 'feed.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n  <title>${esc(site.name)}</title>\n  <link>${base}/</link>\n  <description>${esc(site.description)}</description>\n  <language>${site.lang}</language>\n  <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml" />\n${posts
    .map(
      (p) =>
        `  <item>\n    <title>${esc(p.title)}</title>\n    <link>${base}/posts/${p.slug}</link>\n    <guid isPermaLink="true">${base}/posts/${p.slug}</guid>\n    <pubDate>${rfc822(p.date)}</pubDate>\n    <description>${esc(p.description)}</description>\n${p.tags.map((t) => `    <category>${esc(t)}</category>`).join('\n')}\n  </item>`,
    )
    .join('\n')}\n</channel>\n</rss>\n`,
)
console.log(`postbuild: ${posts.length} posts, ${schematics.length} schematics, ${urls.length} sitemap urls`)
