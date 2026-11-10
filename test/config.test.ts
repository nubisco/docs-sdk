import { describe, expect, it } from 'vitest'
import { defineNubiscoDocs } from '../src/node'

const base = {
  title: 'Acta',
  description: 'What Acta is.',
  base: '/acta/',
  hostname: 'https://docs.nubisco.io/acta/',
  repo: 'nubisco/acta',
  nav: [{ text: 'Users', link: '/users/' }],
  sidebar: {
    '/': [{ text: 'Start', items: [{ text: 'Welcome', link: '/' }] }],
  },
}

describe('defineNubiscoDocs', () => {
  it('states what the product owns and fixes the rest', () => {
    const config = defineNubiscoDocs(base)
    expect(config.title).toBe('Acta')
    expect(config.base).toBe('/acta/')
    expect(config.appearance).toBe(false)
    expect(config.lastUpdated).toBe(true)
    expect(config.cleanUrls).toBe(true)
    expect(config.sitemap?.hostname).toBe('https://docs.nubisco.io/acta/')
    expect(config.themeConfig?.search).toEqual({ provider: 'local' })
  })

  it('lets a product turn clean URLs off', () => {
    const config = defineNubiscoDocs({
      ...base,
      vitepress: { cleanUrls: false },
    })
    expect(config.cleanUrls).toBe(false)
  })

  it('derives the edit link and the theme config from the repository', () => {
    const config = defineNubiscoDocs({
      ...base,
      docsDir: 'docs/',
      branch: 'main',
    })
    expect(config.themeConfig?.editLink?.pattern).toBe(
      'https://github.com/nubisco/acta/edit/main/docs/:path',
    )
    expect((config.themeConfig as any).nubisco).toEqual({
      repo: 'nubisco/acta',
      branch: 'main',
      appearanceControl: false,
    })
  })

  it('renders no GitHub link at all for a product whose repository is private', () => {
    const { repo: _repo, ...closed } = base
    const config = defineNubiscoDocs(closed)
    const theme = config.themeConfig as any
    expect(theme.socialLinks).toBeUndefined()
    expect(theme.editLink).toBeUndefined()
    expect(theme.nubisco).toEqual({
      branch: 'master',
      appearanceControl: false,
    })
    expect(JSON.stringify(config.themeConfig)).not.toContain('github.com')
  })

  it('links to the repository when there is one', () => {
    const theme = defineNubiscoDocs(base).themeConfig as any
    expect(theme.socialLinks).toEqual([
      { icon: 'github', link: 'https://github.com/nubisco/acta' },
    ])
  })

  it('keeps the Square and Round switch for the component library only', () => {
    expect(
      (
        defineNubiscoDocs({ ...base, appearanceControl: true })
          .themeConfig as any
      ).nubisco.appearanceControl,
    ).toBe(true)
  })

  it('adds Nubisco analytics unless told not to', () => {
    const scripts = (c: ReturnType<typeof defineNubiscoDocs>) =>
      (c.head ?? []).filter(([tag]) => tag === 'script')
    expect(scripts(defineNubiscoDocs(base))).toHaveLength(1)
    expect(
      scripts(defineNubiscoDocs({ ...base, analytics: false })),
    ).toHaveLength(0)
  })

  it("merges the product's own VitePress options over the defaults", () => {
    const config = defineNubiscoDocs({
      ...base,
      vitepress: {
        head: [['meta', { name: 'x', content: 'y' }]],
        srcExclude: ['drafts/**'],
      },
    })
    expect(config.head).toContainEqual(['meta', { name: 'x', content: 'y' }])
    expect(config.srcExclude).toEqual(['**/_*.md', 'drafts/**'])
  })

  it('compiles the theme and the library with the page, not from node_modules as is', () => {
    const config = defineNubiscoDocs(base)
    expect(config.vite?.ssr?.noExternal).toEqual(
      expect.arrayContaining(['@nubisco/docs-sdk', '@nubisco/ui']),
    )
  })
})

describe('lastUpdated', () => {
  it('is on unless the product turns it off', () => {
    expect(defineNubiscoDocs(base).lastUpdated).toBe(true)
    expect(
      defineNubiscoDocs({ ...base, vitepress: { lastUpdated: false } })
        .lastUpdated,
    ).toBe(false)
  })
})
