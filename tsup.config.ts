import { defineConfig } from 'tsup'

// Only the Node side is compiled: the config helper and the CLI. The theme is
// Vue single-file components and TypeScript that VitePress compiles with the
// consuming site, so it ships as source.
export default defineConfig({
  entry: { index: 'src/node/index.ts', cli: 'src/node/cli.ts' },
  format: ['esm'],
  dts: { entry: { index: 'src/node/index.ts' } },
  platform: 'node',
  target: 'node22',
  clean: true,
  sourcemap: false,
  external: [/^@nubisco\//, 'vitepress', 'vite', 'mermaid', 'vue'],
})
