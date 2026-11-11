import type { DefaultTheme, UserConfig } from 'vitepress'

/** What the Nubisco theme reads from `themeConfig.nubisco`. */
export interface INubiscoDocsThemeConfig {
  /**
   * `owner/name` on GitHub. Drives the source and issue links in the page
   * header. Absent for a product whose repository is private.
   */
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
  /**
   * `owner/name` on GitHub: `nubisco/acta`. Drives the GitHub link in the top
   * bar, "Edit this page" and the source and issue links in the page header.
   *
   * Leave it out for a product whose repository is private. Those links would
   * 404 for every reader of the public site, so without `repo` none of them is
   * rendered.
   */
  repo?: string
  /** Branch the edit and source links point at. Defaults to `master`. Unused without `repo`. */
  branch?: string
  /** Folder of the docs inside the repository, for the edit link. Defaults to `docs/`. Unused without `repo`. */
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
   * Resolve `<NbButton>` and `NbIcon` names in Markdown at compile time with
   * `@nubisco/ui/vite`. On by default. The component library's own docs turn it
   * off: they register every component globally and link every glyph themselves.
   */
  libraryPlugin?: boolean
  /**
   * Write `search-headings.json` (every page's title and headings) next to the
   * built site, for search outside the site such as the docs hub. On by default.
   */
  headingsIndex?: boolean
  /**
   * Write `llms.txt` (every page as a link with its summary) and
   * `llms-full.txt` (every page's Markdown) next to the built site, for AI
   * assistants. On by default. A page leaves both with `llms: false` in its
   * frontmatter.
   */
  llms?: boolean
  /**
   * Anything else VitePress accepts, merged over the defaults. `vite` and
   * `themeConfig` are merged one level deep, `head` is appended, and a
   * `markdown.config` is called after the SDK's own.
   */
  vitepress?: UserConfig<DefaultTheme.Config>
}
