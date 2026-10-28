import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { enhanceAppWithTabs } from '../plugins/tabs/components'
import Layout from './Layout.vue'
import Nubisco from './Nubisco.vue'
import Mermaid from '../plugins/mermaid/Mermaid.vue'
import '@nubisco/ui/styles'
import './custom.css'

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
