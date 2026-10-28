import { type UserConfig } from 'vitepress'
import { MermaidMarkdown } from './mermaid-markdown'
import { MermaidPlugin, MermaidPluginConfig } from './mermaid-plugin'
import { MermaidConfig } from 'mermaid'

export { MermaidMarkdown } from './mermaid-markdown'
export { MermaidPlugin } from './mermaid-plugin'

export { UserConfig }

declare module 'vitepress' {
  interface UserConfig {
    mermaid?: MermaidConfig
    mermaidPlugin?: MermaidPluginConfig
  }
}

export const withMermaid = (config: UserConfig) => {
  if (!config.markdown) config.markdown = {}
  const markdownConfigOriginal = config.markdown.config || (() => {})
  config.markdown.config = (...args) => {
    MermaidMarkdown(...args, config.mermaidPlugin)
    markdownConfigOriginal(...args)
  }

  if (!config.vite) config.vite = {}
  if (!config.vite.plugins) config.vite.plugins = []
  config.vite.plugins.push(MermaidPlugin(config.mermaid))
  if (!config.vite.optimizeDeps) config.vite.optimizeDeps = {}
  if (!config.vite.optimizeDeps.include) config.vite.optimizeDeps.include = []

  // Named through the packages that own them: under pnpm a site cannot import
  // mermaid's own dependencies, and this package lives in node_modules where
  // Vite does not scan it, so mermaid has to be pre-bundled explicitly.
  const via = '@nubisco/docs-sdk > mermaid'
  config.vite.optimizeDeps.include = [
    ...config.vite.optimizeDeps.include,
    via,
    `${via} > @braintree/sanitize-url`,
    `${via} > dayjs`,
    `${via} > debug`,
    `${via} > cytoscape-cose-bilkent`,
    `${via} > cytoscape`,
  ]
  if (!config.vite.resolve) config.vite.resolve = {}

  const mermaidPluginAlias = {
    'dayjs/plugin/advancedFormat.js': 'dayjs/esm/plugin/advancedFormat',
    'dayjs/plugin/customParseFormat.js': 'dayjs/esm/plugin/customParseFormat',
    'dayjs/plugin/isoWeek.js': 'dayjs/esm/plugin/isoWeek',
    'cytoscape/dist/cytoscape.umd.js': 'cytoscape/dist/cytoscape.esm.js',
  }

  if (!config.vite.resolve.alias) config.vite.resolve.alias = mermaidPluginAlias
  else if (Array.isArray(config.vite.resolve.alias)) {
    config.vite.resolve.alias = [
      ...config.vite.resolve.alias,
      ...Object.entries(mermaidPluginAlias).map(([find, replacement]) => ({
        find,
        replacement,
      })),
    ]
  } else {
    config.vite.resolve.alias = {
      ...config.vite.resolve.alias,
      ...mermaidPluginAlias,
    }
  }

  return config
}
