# Moving a docs site onto `@nubisco/docs-sdk`

How to replace a product's own VitePress setup with this package. It was worked out by
moving the `@nubisco/ui` documentation first, which is the hardest case (it builds from
source, registers every component and has its own demos). A product is simpler.

For a product whose docs are prose with no live demos, which is nearly all of them, the
reference is `openbridge/apps/docs` (migrated in commit `a44d35f`): twelve guide pages and a
home page, with the title and first sentence of each page moved into `title` and `intro`
frontmatter, and a home page rewritten as an ordinary `layout: nubisco` page.

The goal is a site that looks and behaves like the reference, with nothing of the old
theme left behind and no regressions in what it already did.

## 1. Take a baseline first

Before touching anything, start the current docs and screenshot a handful of pages at the
top and scrolled, light and dark: the home page, a long page, a page with code, a page with
a demo. You will compare against these. Where the new design is meant to differ (the header,
the colours), the baseline still tells you what content moved.

## 2. Install

```sh
pnpm add -D @nubisco/docs-sdk @nubisco/ui vue
```

The SDK brings VitePress, mermaid, the SVG loader and the group-icons plugin. Remove those
from the product's own `devDependencies` unless its own docs code imports them. A product
whose docs components import `vitepress` (for `useData` and the like) keeps `vitepress`,
at the same version as the SDK's so there is one copy.

## 3. Replace the config

```ts
// docs/.vitepress/config.ts
import { defineNubiscoDocs } from '@nubisco/docs-sdk'

export default defineNubiscoDocs({
  title: 'Acta',
  description: 'One sentence.',
  base: '/acta/',
  hostname: 'https://docs.nubisco.io/acta/',
  repo: 'nubisco/acta',
  nav: [...],
  sidebar: {...},
  footer: { message: '...', copyright: '...' },
})
```

What the product states is its own: name, address, repository, navigation, footer. Favicons,
`theme-color`, analytics, search, the edit link, `lastUpdated`, the sitemap, the Markdown
plugins and the Vite plugins are the SDK's. Anything else VitePress accepts goes in the
`vitepress` option and is merged over the defaults.

## 4. Replace the theme

```ts
// docs/.vitepress/theme/index.ts
import theme from '@nubisco/docs-sdk/theme'
export default theme
```

A product with its own components extends it:

```ts
import sdk from '@nubisco/docs-sdk/theme'
export default {
  extends: sdk,
  enhanceApp({ app }) {
    app.component('MyDemo', MyDemo)
  },
}
```

Delete the old theme: its layout, `custom.css`, its colour overrides, its home page
component if it only restated the layout. Keep what is the product's own.

## 5. Adopt the layout in the pages

Add `layout: nubisco` to each page, then the fields the layout reads: `title`, `intro` (one
paragraph of inline Markdown), `status`, `source`. A page with facets becomes one file per
tab with `tab` and `pageTabs`, and the old single URL keeps a redirect stub, because GitHub
Pages cannot issue a 301.

## 6. Scripts

```json
{
  "docs:dev": "nubisco-docs dev docs",
  "docs:build": "nubisco-docs build docs",
  "docs:serve": "nubisco-docs preview docs"
}
```

## 7. Verify against the baseline

- the dev server starts and the browser console is clean
- `nubisco-docs build docs` exits 0
- every page loads (sweep the sitemap with a headless browser and count console errors)
- compare screenshots with the baseline, light and dark, top and scrolled, and at phone width
- the header closes into its bar on scroll and the outline follows the headings

## Things that went wrong, so they do not go wrong again

- **Clear `docs/.vitepress/cache` after changing the config or the package.** A stale
  dependency pre-bundle shows up as a blank page and a `does not provide an export named
'default'` error in the console.
- **Import components one by one inside the theme, never the library barrel.** A barrel loads
  every component's styles ahead of the host site's own, and equal-weight rules then resolve
  differently. The reference showcase page changed (a solid border turned dashed) until this
  was fixed. The SDK imports `@nubisco/ui/components/Badge` and friends for this reason.
- **Mermaid has to be pre-bundled by name through the package that owns it** (`@nubisco/docs-sdk
  > mermaid`), because the SDK sits in `node_modules`, where Vite does not scan, and pnpm does
  > not let a site import mermaid's own dependencies.
- **A reinstall from a local tarball with the same name and version is skipped.** When testing
  an unreleased SDK, give each packed tarball a new file name.
- **When the docs build from the library's own source** (only `@nubisco/ui` does), alias
  `@nubisco/ui` and its subpaths to `src`, so the theme and the demos share one copy of the
  components. See `ui/docs/.vitepress/config.ts`. A normal product does not need this.
