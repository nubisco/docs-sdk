import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  absoluteLinks,
  cleanMarkdown,
  collectLlmsPages,
  LLMS_FILE,
  LLMS_FULL_FILE,
  renderLlms,
  splitFrontmatter,
} from '../src/node/llms'
import { defineNubiscoDocs } from '../src/node'

let dir = ''
afterEach(async () => {
  if (dir) await rm(dir, { recursive: true, force: true })
  dir = ''
})

const site = {
  title: 'Acta',
  description: 'Boards and docs, co-managed with agents.',
  hostname: 'https://docs.nubisco.io/acta/',
}

async function fixture() {
  dir = await mkdtemp(join(tmpdir(), 'llms-'))
  await mkdir(join(dir, 'src', 'users'), { recursive: true })
  await mkdir(join(dir, 'src', 'components', 'button'), { recursive: true })
  await mkdir(join(dir, 'out'))
  await writeFile(
    join(dir, 'src', 'index.md'),
    '---\nlayout: home\ntitle: Acta\nintro: "Start here."\n---\n\n# Acta\n\nWelcome.\n',
  )
  await writeFile(
    join(dir, 'src', 'users', 'connect.md'),
    [
      '---',
      'layout: nubisco',
      "title: 'Connect an agent'",
      "intro: 'Point Claude at Acta, it''s quick.'",
      '---',
      '',
      '## Get a token',
      '',
      '```sh',
      'acta token create',
      '```',
      '',
      '<preview>',
      '  <NbButton>Live</NbButton>',
      '</preview>',
      '',
      '<script setup>',
      "import x from './x'",
      '</script>',
    ].join('\n'),
  )
  await writeFile(
    join(dir, 'src', 'components', 'button', 'code.md'),
    '---\ntitle: Button\ntab: code\n---\n\n## Props\n\n<!--@include: ./_shared.md-->\n',
  )
  await writeFile(
    join(dir, 'src', 'components', 'button', '_shared.md'),
    '---\nx: 1\n---\nShared text.\n',
  )
  await writeFile(
    join(dir, 'src', 'users', 'hidden.md'),
    '---\ntitle: Hidden\nllms: false\n---\nNo.\n',
  )
  return {
    srcDir: join(dir, 'src'),
    pages: [
      'index.md',
      'users/connect.md',
      'components/button/code.md',
      'users/hidden.md',
    ],
  }
}

describe('splitFrontmatter', () => {
  it('reads plain, single and double quoted values', () => {
    const { data, body } = splitFrontmatter(
      `---\na: one\nb: 'it''s'\nc: "say \\"hi\\""\n---\nBody`,
    )
    expect(data).toEqual({ a: 'one', b: "it's", c: 'say "hi"' })
    expect(body).toBe('Body')
  })

  it('leaves a page without frontmatter alone', () => {
    expect(splitFrontmatter('# Hi').body).toBe('# Hi')
  })
})

describe('cleanMarkdown', () => {
  it('drops what only means something in a browser and keeps code', () => {
    const out = cleanMarkdown(
      'Text\n\n<preview dir="row">\n<NbButton />\n</preview>\n\n\n\n```vue\n<NbButton />\n```\n<style scoped>.a{}</style>',
    )
    expect(out).toBe('Text\n\n```vue\n<NbButton />\n```')
  })
})

describe('collectLlmsPages', () => {
  it('gives every page its canonical address, title, summary and text', async () => {
    const f = await fixture()
    const pages = await collectLlmsPages({
      ...f,
      base: '/acta/',
      hostname: site.hostname,
      cleanUrls: true,
    })
    expect(pages.map((p) => [p.url, p.title, p.description])).toEqual([
      [
        'https://docs.nubisco.io/acta/components/button/code',
        'Button, code',
        undefined,
      ],
      ['https://docs.nubisco.io/acta/', 'Acta', 'Start here.'],
      [
        'https://docs.nubisco.io/acta/users/connect',
        'Connect an agent',
        "Point Claude at Acta, it's quick.",
      ],
    ])
    const connect = pages[2].body
    expect(connect).toContain('acta token create')
    expect(connect).not.toMatch(/preview|script|NbButton/)
    expect(pages[0].body).toContain('Shared text.')
    expect(pages[0].body).not.toContain('x: 1')
  })

  it('follows a rewrite to the address the page is served at', async () => {
    const f = await fixture()
    const pages = await collectLlmsPages({
      ...f,
      pages: ['users/connect.md'],
      rewrites: { 'users/connect.md': 'connect.md' },
      base: '/acta/',
      hostname: site.hostname,
      cleanUrls: false,
    })
    expect(pages[0].url).toBe('https://docs.nubisco.io/acta/connect.html')
  })
})

describe('renderLlms', () => {
  it('puts the root pages first, then a section per top-level folder', () => {
    const text = renderLlms(site, [
      { url: 'https://d/acta/users/a', path: 'users/a', title: 'A', body: '' },
      {
        url: 'https://d/acta/',
        path: '',
        title: 'Acta',
        description: 'Start\nhere.',
        body: '',
      },
      {
        url: 'https://d/acta/developers/b',
        path: 'developers/b',
        title: 'B',
        body: '',
      },
    ])
    expect(text).toMatch(
      /^# Acta\n\n> Boards and docs, co-managed with agents\.\n/,
    )
    expect(text).toContain(
      '[llms-full.txt](https://docs.nubisco.io/acta/llms-full.txt)',
    )
    const order = [...text.matchAll(/^## (.+)$/gm)].map((m) => m[1])
    expect(order).toEqual(['Overview', 'Users', 'Developers'])
    expect(text).toContain('- [Acta](https://d/acta/): Start here.')
  })

  it("files a folder's own page under its folder, not the root", () => {
    const text = renderLlms(site, [
      { url: 'https://d/acta/', path: '', title: 'Acta', body: '' },
      {
        url: 'https://d/acta/developers/',
        path: 'developers/',
        title: 'Quick start',
        body: '',
      },
      {
        url: 'https://d/acta/developers/arch',
        path: 'developers/arch',
        title: 'Architecture',
        body: '',
      },
    ])
    const overview = text.split('## Developers')[0]
    expect(overview).not.toContain('Quick start')
    expect(text.split('## Developers')[1]).toContain(
      '[Quick start](https://d/acta/developers/)',
    )
  })
})

describe('defineNubiscoDocs', () => {
  const base = {
    ...site,
    base: '/acta/',
    nav: [],
    sidebar: {},
  }

  it('writes both files at the end of the build', async () => {
    const f = await fixture()
    const config = defineNubiscoDocs({ ...base, headingsIndex: false })
    await config.buildEnd?.({
      outDir: join(dir, 'out'),
      srcDir: f.srcDir,
      pages: f.pages,
      cleanUrls: true,
    } as never)
    const map = await readFile(join(dir, 'out', LLMS_FILE), 'utf8')
    const full = await readFile(join(dir, 'out', LLMS_FULL_FILE), 'utf8')
    expect(map).toContain('## Users')
    expect(map).not.toContain('Hidden')
    expect(full).toContain(
      '# Connect an agent\n\nSource: https://docs.nubisco.io/acta/users/connect',
    )
    expect(full).toContain('acta token create')
  })

  it('can be turned off', async () => {
    const f = await fixture()
    const config = defineNubiscoDocs({
      ...base,
      headingsIndex: false,
      llms: false,
    })
    await config.buildEnd?.({
      outDir: join(dir, 'out'),
      srcDir: f.srcDir,
      pages: f.pages,
      cleanUrls: true,
    } as never)
    await expect(readFile(join(dir, 'out', LLMS_FILE))).rejects.toThrow()
  })
})

describe('cleanMarkdown and code', () => {
  it('keeps a script block inside a fence and prose that names a tag', () => {
    const md = [
      'The `<style>` block goes last.',
      '',
      '```vue',
      '<script setup>',
      'const a = 1',
      '</script>',
      '```',
      '',
      '<script setup>',
      'const hidden = 1',
      '</script>',
      '',
      'Then </style> in prose.',
    ].join('\n')
    const out = cleanMarkdown(md)
    expect(out).toContain('The `<style>` block goes last.')
    expect(out).toContain('```vue\n<script setup>\nconst a = 1\n</script>\n```')
    expect(out).not.toContain('hidden')
    expect(out).toContain('Then </style> in prose.')
  })
})

describe('cleanMarkdown and odd end tags', () => {
  it('ends a block at an end tag with spaces or attributes in it', () => {
    expect(cleanMarkdown('A\n\n<script setup>\nx\n</script >\n\nB')).toBe(
      'A\n\nB',
    )
    expect(cleanMarkdown('A\n\n<style>\nx\n</style\tfoo="bar">\n\nB')).toBe(
      'A\n\nB',
    )
  })
})

describe('absoluteLinks', () => {
  const page = 'https://docs.nubisco.io/doodloop/guide/frames'
  const opts = { base: '/doodloop/', cleanUrls: true }

  it('resolves root, relative and .md links the way the site does', () => {
    expect(
      absoluteLinks(
        'See [export](/export), [grid](./grid.md#size), [up](../faq) and [home](/).',
        page,
        opts,
      ),
    ).toBe(
      'See [export](https://docs.nubisco.io/doodloop/export), [grid](https://docs.nubisco.io/doodloop/guide/grid#size), [up](https://docs.nubisco.io/doodloop/faq) and [home](https://docs.nubisco.io/doodloop/).',
    )
  })

  it('leaves external links, anchors, code and already-based links alone', () => {
    const text = [
      '[a](https://semver.org/) [b](mailto:x@y.z) [c](#top) [d](/doodloop/files)',
      '`[e](/inline)`',
      '```md',
      '[f](/fenced)',
      '```',
    ].join('\n')
    expect(absoluteLinks(text, page, opts)).toBe(
      text.replace(
        '(/doodloop/files)',
        '(https://docs.nubisco.io/doodloop/files)',
      ),
    )
  })

  it('keeps .html when the site does not use clean URLs', () => {
    expect(
      absoluteLinks('[x](/export.md)', page, { ...opts, cleanUrls: false }),
    ).toBe('[x](https://docs.nubisco.io/doodloop/export.html)')
  })
})

describe('collectLlmsPages and untitled pages', () => {
  it('names an untitled home page after the site and resolves summary links', async () => {
    dir = await mkdtemp(join(tmpdir(), 'llms-'))
    await mkdir(join(dir, 'src', 'guides'), { recursive: true })
    await writeFile(join(dir, 'src', 'index.md'), '---\nlayout: home\n---\n')
    await writeFile(
      join(dir, 'src', 'guides', 'index.md'),
      "---\nintro: 'Read [export](/export) first.'\n---\nText.\n",
    )
    const pages = await collectLlmsPages({
      srcDir: join(dir, 'src'),
      pages: ['index.md', 'guides/index.md'],
      base: '/acta/',
      hostname: site.hostname,
      cleanUrls: true,
      title: 'Acta',
    })
    expect(pages.map((p) => p.title)).toEqual(['Guides', 'Acta'])
    expect(pages[0].description).toBe(
      'Read [export](https://docs.nubisco.io/acta/export) first.',
    )
  })
})
