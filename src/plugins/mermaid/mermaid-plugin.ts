import { Plugin } from 'vite'
import { ExternalDiagramDefinition, MermaidConfig } from 'mermaid'

interface MermaidPluginOptions extends MermaidConfig {
  externalDiagrams: ExternalDiagramDefinition[]
}

// additional configuration for plugin itself. Separate model, not to risk name conflicts with future MermaidConfig options
export interface MermaidPluginConfig {
  class?: string
}

const DEFAULT_OPTIONS: MermaidConfig = {
  // we set loose as default here because is needed to load images
  securityLevel: 'loose',
  startOnLoad: false,
}

export function MermaidPlugin(
  inlineOptions?: Partial<MermaidPluginOptions>,
): Plugin {
  const options = {
    ...DEFAULT_OPTIONS,
    ...inlineOptions,
  }

  const virtualModuleId = 'virtual:mermaid-config'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'vite-plugin-mermaid',
    // The component is registered by the theme (`src/theme/index.ts`), not
    // injected into VitePress's client entry by a path in the consumer's tree.

    async resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    async load(this, id) {
      if (id === resolvedVirtualModuleId) {
        return `export default ${JSON.stringify(options)};`
      }
    },
  }
}
