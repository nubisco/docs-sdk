import type { DefaultTheme, UserConfig } from 'vitepress'

/** What the Nubisco theme reads from `themeConfig.nubisco`. */
export interface INubiscoDocsThemeConfig {
  /** `owner/name` on GitHub. Drives the source and issue links in the page header. */
  repo?: string
  /** The branch the source links point at. Defaults to `master`. */
  branch?: string
  /**
   * Show the Square and Round switch beside the colour mode. It belongs to the
   * component library's own docs and is off everywhere else.
   */
  appearanceControl?: boolean
}

export interface INubiscoDocsOptions {
  /** The product's name, shown in the top bar and the page header. */
  title: string
  /** One sentence, for search engines and link previews. */
  description: string
  /** URL prefix the site is served under, with both slashes: `/acta/`. */
  base: string
  /** The public address of the site, for the sitemap: `https://docs.nubisco.io/acta/`. */
  hostname: string
  /** `owner/name` on GitHub: `nubisco/acta`. */
  repo: string
  /** Branch the edit and source links point at. Defaults to `master`. */
  branch?: string
  /** Folder of the docs inside the repository, for the edit link. Defaults to `docs/`. */
  docsDir?: string
  /** Path of the product's mark under `public/`. Defaults to `/logo.svg`. */
  logo?: string
  /** Browser chrome colour. Defaults to the dark ground. */
  themeColor?: string
  /** The top bar's links, in the order the standard sets (see the docs standard). */
  nav: DefaultTheme.NavItem[]
  /** The left navigation. Keyed by path prefix, or one list. */
  sidebar: DefaultTheme.Sidebar
  /** HTML for the two footer lines. Links are allowed. */
  footer?: { message?: string; copyright?: string }
  /** Analytics script. Nubisco's by default, `false` for none. */
  analytics?: string | false
  /** Show the Square and Round switch. Component library only. */
  appearanceControl?: boolean
  /**
   * Anything else VitePress accepts, merged over the defaults. `vite` and
   * `themeConfig` are merged one level deep, `head` is appended, and a
   * `markdown.config` is called after the SDK's own.
   */
  vitepress?: UserConfig<DefaultTheme.Config>
}
