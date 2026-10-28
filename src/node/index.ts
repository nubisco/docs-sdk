import { defineConfig, type UserConfig, type DefaultTheme } from 'vitepress'
import type { Plugin } from 'vite'
import svgLoader from 'vite-svg-loader'
import {
  groupIconMdPlugin,
  groupIconVitePlugin,
} from 'vitepress-plugin-group-icons'
import { nubiscoUI } from '@nubisco/ui/vite'
import { fonts } from '@nubisco/ui/plugins/fonts'
import { tabsMarkdownPlugin } from '../plugins/tabs/markdown'
import { withMermaid } from '../plugins/mermaid'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { INubiscoDocsOptions } from './types'

export type { INubiscoDocsOptions, INubiscoDocsThemeConfig } from './types'

const ANALYTICS = 'https://analytics.nubisco.io/script.js'

const EMPTY_SHEET = fileURLToPath(
  new URL('../src/theme/empty.css', import.meta.url),
)

/**
 * The theme links the library's built component sheets (`dist/styles/*.css`).
 * The library's own docs build from its source, where every component carries
 * its styles and `dist` may not exist yet, so those imports resolve to an empty
 * sheet there.
 */
function librarySheetsFromSource(): Plugin {
  return {
    name: 'nubisco-docs:library-sheets',
    enforce: 'pre',
    resolveId(id) {
      if (/^@nubisco\/ui\/dist\/styles\/[^/]+\.css$/.test(id))
        return EMPTY_SHEET
    },
  }
}

/**
 * The VitePress config for a Nubisco product's documentation.
 *
 * ```ts
 * // docs/.vitepress/config.ts
 * import { defineNubiscoDocs } from '@nubisco/docs-sdk'
 *
 * export default defineNubiscoDocs({
 *   title: 'Acta',
 *   description: '…',
 *   base: '/acta/',
 *   hostname: 'https://docs.nubisco.io/acta/',
 *   repo: 'nubisco/acta',
 *   nav: [...],
 *   sidebar: { ... },
 * })
 * ```
 *
 * Everything the design standard fixes is set here, so a product states only
 * what is its own: its name, its address, its navigation and its footer.
 */
export function defineNubiscoDocs(
  options: INubiscoDocsOptions,
): UserConfig<DefaultTheme.Config> {
  const base = options.base
  const logo = options.logo ?? '/logo.svg'
  const extra = options.vitepress ?? {}
  const analytics = options.analytics ?? ANALYTICS
  const docsDir = options.docsDir ?? 'docs/'
  const branch = options.branch ?? 'master'

  const config = defineConfig({
    ...extra,
    title: options.title,
    description: options.description,
    base,
    // The theme owns light and dark (`useTheme()` sets `.dark`), so VitePress's
    // own appearance switch stays off.
    appearance: false,
    // `_shared.md` fragments are included by tab pages. They are not pages.
    srcExclude: ['**/_*.md', ...(extra.srcExclude ?? [])],
    // Read from the git log, so a site built where there is no repository (a
    // container with `.git` excluded) turns it off with `vitepress.lastUpdated`.
    lastUpdated: extra.lastUpdated ?? true,
    head: [
      ['link', { rel: 'icon', href: `${base}favicon.ico`, sizes: 'any' }],
      [
        'link',
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: `${base}favicon-32x32.png`,
        },
      ],
      [
        'link',
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '16x16',
          href: `${base}favicon-16x16.png`,
        },
      ],
      [
        'link',
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: `${base}apple-touch-icon.png`,
        },
      ],
      ['link', { rel: 'manifest', href: `${base}site.webmanifest` }],
      [
        'meta',
        { name: 'theme-color', content: options.themeColor ?? '#0d0d0f' },
      ],
      ...(analytics
        ? [
            ['script', { defer: '', src: analytics }] as [
              string,
              Record<string, string>,
            ],
          ]
        : []),
      ...(extra.head ?? []),
    ],
    markdown: {
      ...extra.markdown,
      config(md) {
        // The two markdown-it type trees (VitePress's and the plugin's) differ in
        // patch version only.
        md.use(tabsMarkdownPlugin as never)
        md.use(groupIconMdPlugin as never)
        extra.markdown?.config?.(md)
      },
    },
    // The icon and manifest links are the design's, but the files are the
    // product's. A product that does not ship one gets no link to a 404.
    async transformHead(ctx) {
      const own =
        (extra.transformHead && (await extra.transformHead(ctx))) ?? []
      const shipped = ctx.head.filter((entry) => {
        const href = entry[1]?.href
        if (typeof href !== 'string' || !href.startsWith(base)) return true
        return existsSync(
          join(ctx.siteConfig.srcDir, 'public', href.slice(base.length)),
        )
      })
      // No favicon of its own: the mark does the job, when it is an SVG.
      const hasIcon = shipped.some(
        (entry) => entry[0] === 'link' && /icon/.test(entry[1]?.rel ?? ''),
      )
      const mark = join(ctx.siteConfig.srcDir, 'public', logo)
      if (!hasIcon && logo.endsWith('.svg') && existsSync(mark)) {
        shipped.push([
          'link',
          {
            rel: 'icon',
            type: 'image/svg+xml',
            href: `${base}${logo.replace(/^\//, '')}`,
          },
        ])
      }
      ctx.head.length = 0
      ctx.head.push(...shipped)
      return own
    },
    sitemap: { hostname: options.hostname, ...extra.sitemap },
    vite: {
      ...extra.vite,
      plugins: [
        // Path merging and conversion off: they distort brand marks and glyph
        // artwork that the docs import as components.
        svgLoader({
          svgoConfig: {
            plugins: [
              {
                name: 'preset-default',
                params: {
                  overrides: { convertPathData: false, mergePaths: false },
                },
              },
            ],
          },
        }),
        groupIconVitePlugin(),
        // The theme passes icon modules to NbIcon at run time, which the glyph
        // transform cannot see through. They need no catalogue.
        ...(options.libraryPlugin === false
          ? [librarySheetsFromSource()]
          : [nubiscoUI({ glyphs: { catalog: 'off', warnUnresolved: false } })]),
        fonts(),
        ...(extra.vite?.plugins ?? []),
      ],
      ssr: {
        ...extra.vite?.ssr,
        // The theme and the library ship Vue sources and ESM, which VitePress
        // must compile with the page, not load from node_modules as is.
        noExternal: [
          '@nubisco/docs-sdk',
          '@nubisco/ui',
          'vue',
          ...((extra.vite?.ssr?.noExternal as string[]) ?? []),
        ],
      },
      optimizeDeps: {
        ...extra.vite?.optimizeDeps,
        exclude: [
          '@nubisco/docs-sdk',
          ...(extra.vite?.optimizeDeps?.exclude ?? []),
        ],
      },
      css: {
        ...extra.vite?.css,
        preprocessorOptions: {
          scss: { api: 'modern-compiler' },
          ...extra.vite?.css?.preprocessorOptions,
        },
      },
    },
    themeConfig: {
      siteTitle: options.title,
      logo: { src: logo, width: 24, height: 24 },
      nav: options.nav,
      sidebar: options.sidebar,
      socialLinks: [
        { icon: 'github', link: `https://github.com/${options.repo}` },
      ],
      editLink: {
        pattern: `https://github.com/${options.repo}/edit/${branch}/${docsDir}:path`,
        text: 'Edit this page on GitHub',
      },
      search: { provider: 'local' },
      lastUpdated: { text: 'Last updated' },
      footer: options.footer,
      ...extra.themeConfig,
      // Read by the theme. Typed in `INubiscoDocsThemeConfig`.
      nubisco: {
        repo: options.repo,
        branch,
        appearanceControl: options.appearanceControl ?? false,
      },
    } as DefaultTheme.Config,
  })

  return withMermaid(config)
}
