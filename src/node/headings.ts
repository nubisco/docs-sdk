import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'

/**
 * A small, stable-named index of every page's title and headings, written next
 * to the built site as `search-headings.json`.
 *
 * It exists for search that lives outside the site, such as the docs hub on
 * nubisco.io, which searches every product's docs at once. VitePress's own
 * local index is not usable there: it is the full text (hundreds of KB for a
 * large site) under a hashed file name that changes on every build. This one
 * holds titles and headings only, at an address that does not move, and the
 * site's own search still takes over once a result is opened.
 *
 * It is read from the built HTML rather than the Markdown, so it lists exactly
 * what the published pages carry, anchors included.
 */

export const HEADINGS_FILE = 'search-headings.json'

export interface IHeadingEntry {
  /** The anchor on the page, without the `#`. */
  id: string
  text: string
  /** 2 for `##`, 3 for `###`, and so on. */
  level: number
}

export interface IPageEntry {
  /** The page's address, base included, as links on the site write it. */
  url: string
  title: string
  description?: string
  headings: IHeadingEntry[]
}

export interface IHeadingsIndex {
  version: 1
  site: string
  base: string
  pages: IPageEntry[]
}

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
}

/** Markup to plain text: tags dropped, entities decoded, whitespace folded. */
export function toText(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, code: string) => {
      if (code[0] === '#') {
        const n =
          code[1] === 'x' || code[1] === 'X'
            ? parseInt(code.slice(2), 16)
            : parseInt(code.slice(1), 10)
        return Number.isFinite(n) ? String.fromCodePoint(n) : whole
      }
      return ENTITIES[code.toLowerCase()] ?? whole
    })
    .replace(/[​‌‍﻿]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// A content heading is the one markdown-it-anchor writes: an id, tabindex -1
// and a permalink. The theme's own headings (sidebar groups, the page header)
// carry none of these, so they are not mistaken for sections of the page.
const HEADING =
  /<h([2-6])\s+id="([^"]+)"\s+tabindex="-1"[^>]*>([\s\S]*?)<a\s+class="header-anchor"/g

export function extractPage(
  html: string,
  siteTitle: string,
): Omit<IPageEntry, 'url'> {
  const rawTitle = toText(/<title>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? '')
  // VitePress titles a page "Page | Site". The site is known, so drop it.
  const suffix = ` | ${siteTitle}`
  const title = rawTitle.endsWith(suffix)
    ? rawTitle.slice(0, -suffix.length)
    : rawTitle
  const description = toText(
    /<meta\s+name="description"\s+content="([^"]*)"/i.exec(html)?.[1] ?? '',
  )
  const headings: IHeadingEntry[] = []
  for (const m of html.matchAll(HEADING)) {
    const text = toText(m[3])
    if (text) headings.push({ id: m[2], text, level: Number(m[1]) })
  }
  return { title, ...(description ? { description } : {}), headings }
}

/** `guide/setup.html` under `/acta/` is `/acta/guide/setup` with clean URLs. */
export function pageUrl(file: string, base: string, cleanUrls: boolean) {
  const path = file.split(sep).join('/')
  if (path === 'index.html') return base
  if (path.endsWith('/index.html'))
    return base + path.slice(0, -'index.html'.length)
  return base + (cleanUrls ? path.slice(0, -'.html'.length) : path)
}

async function htmlFiles(dir: string): Promise<string[]> {
  const out: string[] = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      // Built assets, never pages.
      if (entry.name === 'assets') continue
      out.push(...(await htmlFiles(full)))
    } else if (entry.name.endsWith('.html')) out.push(full)
  }
  return out
}

export async function buildHeadingsIndex(opts: {
  outDir: string
  base: string
  site: string
  cleanUrls: boolean
}): Promise<IHeadingsIndex> {
  const files = (await htmlFiles(opts.outDir))
    .map((f) => relative(opts.outDir, f))
    .filter((f) => f !== '404.html')
    .sort()
  const pages: IPageEntry[] = []
  for (const file of files) {
    const html = await readFile(join(opts.outDir, file), 'utf8')
    pages.push({
      url: pageUrl(file, opts.base, opts.cleanUrls),
      ...extractPage(html, opts.site),
    })
  }
  return { version: 1, site: opts.site, base: opts.base, pages }
}

export async function writeHeadingsIndex(opts: {
  outDir: string
  base: string
  site: string
  cleanUrls: boolean
}): Promise<void> {
  const index = await buildHeadingsIndex(opts)
  await writeFile(join(opts.outDir, HEADINGS_FILE), JSON.stringify(index))
}
