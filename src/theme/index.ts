import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { enhanceAppWithTabs } from '../plugins/tabs/components'
import Layout from './Layout.vue'
import Nubisco from './Nubisco.vue'
import Mermaid from '../plugins/mermaid/Mermaid.vue'
// The chrome first, the library's styles after it: where the two have equal
// weight the library wins, as it did in the docs before they were extracted.
import './custom.css'
import '@nubisco/ui/styles'
// The theme's own components render these library components. Their sheets are
// linked here because the library's Vite plugin only resolves components in the
// product's files, never in this package.
import '@nubisco/ui/dist/styles/Badge.css'
import '@nubisco/ui/dist/styles/Icon.css'
import '@nubisco/ui/dist/styles/TextInput.css'

/**
 * The Nubisco docs theme: Carbon's structure in the library's own layers. A
 * product uses it as is. The component library's docs extend it, adding their
 * demos and the Square and Round switch.
 *
 * ```ts
 * // docs/.vitepress/theme/index.ts
 * import theme from '@nubisco/docs-sdk/theme'
 * export default theme
 * ```
 */
const theme: Theme = {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    enhanceAppWithTabs(app)
    // Pages opt in with `layout: nubisco` in frontmatter.
    app.component('nubisco', Nubisco)
    // The target of the ```mermaid fences the markdown plugin rewrites.
    app.component('Mermaid', Mermaid)
  },
}

export default theme
