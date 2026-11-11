import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  buildHeadingsIndex,
  extractPage,
  HEADINGS_FILE,
  pageUrl,
  toText,
  writeHeadingsIndex,
} from '../src/node/headings'
import { defineNubiscoDocs } from '../src/node'

let dir = ''

// The shape VitePress and the theme publish, copied from docs.nubisco.io/acta/.
const page = `<!DOCTYPE html><html><head>
<title>Connect an agent | Acta</title>
<meta name="description" content="Point Claude &amp; other clients at Acta.">
</head><body>
<h2 class="text" data-v-fb4b0c86>Users</h2>
<h1 class="doc-header__title" data-v-7d4b5cc8>Connect an agent</h1>
<h2 id="get-a-token" tabindex="-1">Get a token <a class="header-anchor" href="#get-a-token" aria-label="Permalink to &quot;Get a token&quot;">&#8203;</a></h2>
<p>…</p>
<h3 id="claude-code" tabindex="-1"><code>claude</code> &amp; Code <a class="header-anchor" href="#claude-code">​</a></h3>
</body></html>`

describe('toText', () => {
  it('leaves no tag behind when tags are nested', () => {
    expect(toText('a<scr<b>ipt>b</scr</b>ipt>c')).toBe('abc')
  })

  it('keeps a component name written as entities', () => {
    expect(toText('The &lt;NbCard&gt; API')).toBe('The <NbCard> API')
  })

  it('drops tags, decodes entities and folds whitespace', () => {
    expect(toText('<code>a</code> &amp;  b &quot;c&quot; &#39;d&#x27; ​')).toBe(
      `a & b "c" 'd'`,
    )
  })
})

describe('extractPage', () => {
  it('takes the title without the site name, the description and the content headings', () => {
    expect(extractPage(page, 'Acta')).toEqual({
      title: 'Connect an agent',
      description: 'Point Claude & other clients at Acta.',
      headings: [
        { id: 'get-a-token', text: 'Get a token', level: 2 },
        { id: 'claude-code', text: 'claude & Code', level: 3 },
      ],
    })
  })

  it('ignores the theme headings, which carry no anchor', () => {
    const ids = extractPage(page, 'Acta').headings.map((h) => h.text)
    expect(ids).not.toContain('Users')
    expect(ids).not.toContain('Connect an agent')
  })
})

describe('pageUrl', () => {
  it('writes the address the site links to', () => {
    expect(pageUrl('index.html', '/acta/', true)).toBe('/acta/')
    expect(pageUrl('users/index.html', '/acta/', true)).toBe('/acta/users/')
    expect(pageUrl('users/goals.html', '/acta/', true)).toBe(
      '/acta/users/goals',
    )
    expect(pageUrl('users/goals.html', '/acta/', false)).toBe(
      '/acta/users/goals.html',
    )
  })
})

describe('the index file', () => {
  afterEach(async () => {
    if (dir) await rm(dir, { recursive: true, force: true })
  })

  it('lists every built page except 404 and the assets', async () => {
    dir = await mkdtemp(join(tmpdir(), 'headings-'))
    await mkdir(join(dir, 'users'))
    await mkdir(join(dir, 'assets'))
    await writeFile(join(dir, 'index.html'), '<title>Acta</title>')
    await writeFile(join(dir, 'users', 'connect.html'), page)
    await writeFile(join(dir, '404.html'), '<title>404 | Acta</title>')
    await writeFile(join(dir, 'assets', 'x.html'), '<title>no</title>')

    const opts = { outDir: dir, base: '/acta/', site: 'Acta', cleanUrls: true }
    const index = await buildHeadingsIndex(opts)
    expect(index.version).toBe(1)
    expect(index.pages.map((p) => p.url)).toEqual([
      '/acta/',
      '/acta/users/connect',
    ])

    await writeHeadingsIndex(opts)
    const written = JSON.parse(await readFile(join(dir, HEADINGS_FILE), 'utf8'))
    expect(written).toEqual(index)
  })
})

describe('defineNubiscoDocs', () => {
  const base = {
    title: 'Acta',
    description: 'What Acta is.',
    base: '/acta/',
    hostname: 'https://docs.nubisco.io/acta/',
    nav: [],
    sidebar: {},
  }

  it('writes the index at the end of the build and still runs a product hook', async () => {
    let called = false
    dir = await mkdtemp(join(tmpdir(), 'headings-'))
    await writeFile(join(dir, 'index.html'), '<title>Acta</title>')
    const config = defineNubiscoDocs({
      ...base,
      vitepress: { buildEnd: () => void (called = true) },
    })
    await config.buildEnd?.({ outDir: dir, cleanUrls: true } as never)
    expect(called).toBe(true)
    expect(
      JSON.parse(await readFile(join(dir, HEADINGS_FILE), 'utf8')).site,
    ).toBe('Acta')
    await rm(dir, { recursive: true, force: true })
  })

  it('can be turned off', async () => {
    dir = await mkdtemp(join(tmpdir(), 'headings-'))
    const config = defineNubiscoDocs({ ...base, headingsIndex: false })
    await config.buildEnd?.({ outDir: dir, cleanUrls: true } as never)
    await expect(readFile(join(dir, HEADINGS_FILE))).rejects.toThrow()
    await rm(dir, { recursive: true, force: true })
  })
})
