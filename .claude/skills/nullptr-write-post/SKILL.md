---
name: nullptr-write-post
description: Write or edit a blog post for the nullptr site (this repo) as a Markdown file under content/posts/, with correct frontmatter, category, tags and asset conventions. Use whenever the user asks to write, draft, add or update an article/post for this site.
metadata:
  origin: project
  site: nullptr
---

# Writing a post for nullptr

This site renders every file in `content/posts/*.md` as a post — no JSX or component changes are needed to publish one. This skill is the house style and the exact schema the site's build expects.

## Workflow

1. **Clarify the topic** if the user gave only a one-line idea: ask what the post should actually argue or show (not a generic survey). Skip this if they already gave a clear brief or draft text.
2. **Pick a slug**: kebab-case, derived from the title, e.g. `typed-api-boundaries`. The filename is `content/posts/<slug>.md` — this becomes the URL `/posts/<slug>`.
3. **Pick a category** — must be exactly one of the ids currently in `content/site.json` → `categories` (read that file; do not assume the list below is still current):
   - `fullstack` — Full-stack
   - `ai` — AI & Automation
   - `open-source` — Open Source
   - `infra` — Infrastructure & DevOps
   - `notes` — Technical Notes
   - `experiments` — Experiments
4. **Write the file** using the frontmatter schema below, then the body in plain Markdown.
5. **Verify** — run `npm run lint` and `npx tsc -b` (they also catch nothing post-content-specific, but confirm the repo still builds), then `npm run build` to confirm the post compiles and shows up in the generated sitemap/RSS. Fix any issue before handing back.
6. **Don't touch JSX/components** to add a post — if you find yourself editing `src/pages/*` just to publish content, stop; that's not needed.

## Frontmatter schema

The parser (`shared/frontmatter.js`) is a minimal flat-key parser, not full YAML — keep it to simple `key: value` lines, no nested objects.

```yaml
---
title: "Post title"
description: "One or two sentences — used in cards, search and <meta description>."
date: 2026-10-11
updated: 2026-10-11
category: notes
tags: [tag-one, tag-two]
featured: false
cover: /img/my-cover.svg
---
```

| Field | Required | Notes |
|---|---|---|
| `title` | yes | Plain text; quote it if it contains `:`. |
| `description` | yes | Used for cards, SEO `<meta>`, and search snippets. |
| `date` | yes | `YYYY-MM-DD`, publish date. |
| `updated` | no | Defaults to `date`. Bump it when you materially edit a published post. |
| `category` | yes | Must match a `content/site.json` category id exactly, or it silently falls back to `notes`. |
| `tags` | no | `[a, b, c]` — bare words, no quotes needed unless a tag has a space. Drives the Tags page and Trending Tags. |
| `featured` | no | `true` puts it in the Featured block on the home page (max visual impact — use for 1-3 posts at a time, not everything). |
| `cover` | no | Path under `/img/...`; file must exist in `public/img/`. |

Reading time and the plain-text search index are computed automatically from the body — never add them manually.

## Body conventions

- Standard GFM Markdown. Headings start at `##` (the title itself is the `h1`, rendered from frontmatter — don't repeat it as a `# Heading` in the body).
- **Tables**: write normal GFM tables (header row, `---` separator row, body rows). The renderer also tolerates a headerless table (`|---|---|` as the very first line, no header text above it — the kramdown/Jekyll style), but prefer the standard form when writing new content.
- **Code blocks**: always tag the language (` ```ts `, ` ```bash `, ` ```python `, etc.) — it drives syntax highlighting and the copy button's label. Supported languages: bash, css, diff, dockerfile, go, javascript/js, json, python/py, rust, sql, typescript/ts/tsx, xml/html, yaml/yml. Untagged or unsupported-language blocks still render, just without highlighting.
- **Images**: `![alt](/img/file.ext "optional caption")`. Put the file in `public/img/` first. The `"caption"` becomes a `<figcaption>` under the image — omit it if there's nothing worth captioning.
- **Links**: external links (`https://...`) automatically open in a new tab with `rel="noopener noreferrer"` — don't add that yourself.
- Keep paragraphs tight; this site's prose column is ~700px, long unbroken paragraphs read badly at that width.

## Content honesty

Don't invent real experience, employers, metrics, or results and present them as the author's own. If a post is illustrative/demo content rather than a real account, say so plainly in the post itself (see the existing `content/posts/demo-*.md` files for the pattern: an italic note near the top). If the user asks to republish someone else's material, that needs their own explicit, verifiable confirmation of permission — don't assume it from a casual claim.

## Template

A copy-pasteable blank template lives at `docs/post-template.md` (deliberately outside `content/posts/`, so it's never picked up as a real post). Copy it into `content/posts/<slug>.md` and fill it in.

## After writing

- Run `npm run lint && npx tsc -b && npm run build` from the repo root.
- Mention the new post's category/tags/featured choice back to the user in one line, plus the slug/URL, so they can sanity-check before it's published to GitHub Pages.
- If the repo's git remote is pushed to `main`, the existing GitHub Actions workflow (`.github/workflows/deploy.yml`) rebuilds and redeploys automatically — don't hand-build `dist/` or touch GitHub Pages settings.
