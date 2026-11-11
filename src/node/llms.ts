import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { pageUrl } from './headings'

/**
 * `llms.txt` and `llms-full.txt`, written next to the built site.
 *
 * They are for AI assistants and answer engines, which read a site to quote it
 * and cite it. `llms.txt` (the format at llmstxt.org) is the map: the site in
 * one sentence, then every page as a link with its summary, grouped by the
 * top-level section (`users/`, `developers/`). `llms-full.txt` is every page's
 * Markdown in one file, so an assistant can read the whole site in one fetch.
 *
 * Both come from the Markdown sources rather than the built HTML, so the text
 * keeps its headings, lists and code blocks. What only means something in a
 * browser is dropped: frontmatter, `<script>` and `<style>` blocks, and live
 * `<preview>` demos. Every link is absolute and canonical, the same address
 * the sitemap gives.
 */

export const LLMS_FILE = 'llms.txt'
export const LLMS_FULL_FILE = 'llms-full.txt'

export interface ILlmsPage {
  /** Absolute, canonical address. */
  url: string
  /** Path under the base, for grouping and sorting: `users/goals`. */
  path: string
  title: string
  description?: string
  /** The page's Markdown, cleaned for reading as text. */
  body: string
}

/** The frontmatter block and the few string fields this file reads from it. */
export function splitFrontmatter(source: string): {
  data: Record<string, string>
  body: string
} {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source)
  if (!m) return { data: {}, body: source }
  const data: Record<string, string> = {}
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line)
    if (!kv) continue
    let value = kv[2].trim()
    const quoted = /^(['"])([\s\S]*)\1$/.exec(value)
    if (quoted) {
      value = quoted[2]
      if (quoted[1] === "'") value = value.replace(/''/g, "'")
      else value = value.replace(/\\"/g, '"')
    }
    data[kv[1]] = value
  }
  return { data, body: source.slice(m[0].length) }
}

// Blocks that render something in a browser and are noise as text. A `<script>`
// in a page is its `<script setup>`, a `<preview>` is a live demo whose code is
// shown in a fenced block beside it anyway. Only a block that starts a line
// counts, so prose that names a tag (`the <style> block`) stays.
const BROWSER_ONLY = [
  /^[ \t]*<script\b[^>]*>[\s\S]*?<\/script>[ \t]*$/gim,
  /^[ \t]*<style\b[^>]*>[\s\S]*?<\/style>[ \t]*$/gim,
  /^[ \t]*<preview\b[^>]*>[\s\S]*?<\/preview>[ \t]*$/gim,
  /^[ \t]*<preview\b[^>]*\/>[ \t]*$/gim,
]

const FENCE = /^[ \t]*(`{3,}|~{3,})/

/**
 * Markdown fit to read as text: browser-only blocks out, blank runs folded.
 * Fenced code is left exactly as written, since a `<script setup>` in a
 * ```vue example is the point of the example.
 */
export function cleanMarkdown(body: string): string {
  const segments: { code: boolean; text: string }[] = []
  let fence = ''
  let buf: string[] = []
  const flush = (code: boolean) => {
    if (buf.length) segments.push({ code, text: buf.join('\n') })
    buf = []
  }
  for (const line of body.split('\n')) {
    const m = FENCE.exec(line)
    if (!fence && m) {
      flush(false)
      fence = m[1]
      buf.push(line)
    } else if (
      fence &&
      m &&
      m[1][0] === fence[0] &&
      m[1].length >= fence.length
    ) {
      buf.push(line)
      flush(true)
      fence = ''
    } else buf.push(line)
  }
  flush(!!fence)
  return segments
    .map(({ code, text }) => {
      if (code) return text
      let out = text
      for (const re of BROWSER_ONLY) out = out.replace(re, '')
      return out.replace(/\n{3,}/g, '\n\n')
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const INCLUDE = /<!--\s*@include:\s*([^\s]+?)\s*-->/g

/** Inline `<!--@include: ./_shared.md-->` fragments, as VitePress does. */
export async function resolveIncludes(
  body: string,
  file: string,
  depth = 0,
): Promise<string> {
  if (depth > 3) return body
  const parts: string[] = []
  let last = 0
  for (const m of body.matchAll(INCLUDE)) {
    parts.push(body.slice(last, m.index))
    last = m.index + m[0].length
    const target = join(dirname(file), m[1].replace(/\{[^}]*\}$/, ''))
    try {
      const included = splitFrontmatter(await readFile(target, 'utf8')).body
      parts.push(await resolveIncludes(included, target, depth + 1))
    } catch {
      // A fragment that is not there renders nothing on the site either.
    }
  }
  parts.push(body.slice(last))
  return parts.join('')
}

/** `users/my-goals` reads as "Users", a root page as the site's own name. */
function sectionOf(path: string, site: string): string {
  const first = path.split('/')[0]
  if (!path.includes('/') || !first) return site
  return first
    .split('-')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ')
}

export async function collectLlmsPages(opts: {
  srcDir: string
  /** Source pages relative to `srcDir`, as VitePress lists them. */
  pages: string[]
  /** VitePress `rewrites.map`: source page to the page it is served as. */
  rewrites?: Record<string, string | undefined>
  base: string
  hostname: string
  cleanUrls: boolean
}): Promise<ILlmsPage[]> {
  const origin = new URL(opts.hostname).origin
  const out: ILlmsPage[] = []
  for (const page of [...opts.pages].sort()) {
    const file = join(opts.srcDir, page)
    const { data, body } = splitFrontmatter(await readFile(file, 'utf8'))
    if (data.llms === 'false') continue
    const served = (opts.rewrites?.[page] ?? page).replace(/\.md$/, '.html')
    const urlPath = pageUrl(served, opts.base, opts.cleanUrls)
    const text = cleanMarkdown(await resolveIncludes(body, file))
    const heading = /^#\s+(.+)$/m.exec(text)?.[1]?.trim()
    const name = data.title || heading || page.replace(/\.md$/, '')
    // Tabs are one page each and share a title: "Button, code".
    const title = data.tab ? `${name}, ${data.tab}` : name
    const description = data.description || data.intro || undefined
    out.push({
      url: origin + urlPath,
      path: urlPath.slice(opts.base.length).replace(/\/$/, ''),
      title,
      ...(description ? { description } : {}),
      body: text,
    })
  }
  return out
}

/** One line of inline Markdown, so a summary never breaks the list. */
const oneLine = (s: string) => s.replace(/\s+/g, ' ').trim()

export function renderLlms(
  site: { title: string; description: string; hostname: string },
  pages: ILlmsPage[],
): string {
  const root = site.hostname.endsWith('/') ? site.hostname : `${site.hostname}/`
  const lines = [
    `# ${site.title}`,
    '',
    `> ${oneLine(site.description)}`,
    '',
    `The documentation for ${site.title}, published at ${root}. Every link below is the page's canonical address. The full text of every page, as Markdown, is in [${LLMS_FULL_FILE}](${root}${LLMS_FULL_FILE}).`,
  ]
  const groups = new Map<string, ILlmsPage[]>()
  for (const p of pages) {
    const key = sectionOf(p.path, 'Overview')
    groups.set(key, [...(groups.get(key) ?? []), p])
  }
  // The site's own root pages first, then the sections in path order.
  const keys = [...groups.keys()].sort((a, b) =>
    a === 'Overview' ? -1 : b === 'Overview' ? 1 : 0,
  )
  for (const key of keys) {
    lines.push('', `## ${key}`, '')
    for (const p of groups.get(key)!) {
      const summary = p.description ? `: ${oneLine(p.description)}` : ''
      lines.push(`- [${oneLine(p.title)}](${p.url})${summary}`)
    }
  }
  return lines.join('\n') + '\n'
}

export function renderLlmsFull(
  site: { title: string; description: string },
  pages: ILlmsPage[],
): string {
  const parts = [`# ${site.title}`, '', `> ${oneLine(site.description)}`]
  for (const p of pages) {
    parts.push('', '---', '', `# ${oneLine(p.title)}`, '', `Source: ${p.url}`)
    if (p.description) parts.push('', oneLine(p.description))
    // The page's own h1, if it has one, is the title above.
    const body = p.body.replace(/^#\s+.+\n?/, '').trim()
    if (body) parts.push('', body)
  }
  return parts.join('\n') + '\n'
}

export async function writeLlms(opts: {
  outDir: string
  srcDir: string
  pages: string[]
  rewrites?: Record<string, string | undefined>
  base: string
  hostname: string
  cleanUrls: boolean
  title: string
  description: string
}): Promise<void> {
  const pages = await collectLlmsPages(opts)
  const site = {
    title: opts.title,
    description: opts.description,
    hostname: opts.hostname,
  }
  await writeFile(join(opts.outDir, LLMS_FILE), renderLlms(site, pages))
  await writeFile(
    join(opts.outDir, LLMS_FULL_FILE),
    renderLlmsFull(site, pages),
  )
}
