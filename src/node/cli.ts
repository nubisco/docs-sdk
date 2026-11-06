#!/usr/bin/env node
import { build, createServer, serve } from 'vitepress'

const USAGE = `nubisco-docs <command> [root] [--port <n>]

  dev       start the dev server
  build     build the static site
  preview   serve a built site

root is the docs folder, "docs" by default.`

const [command, ...rest] = process.argv.slice(2)
const flagAt = rest.indexOf('--port')
const port = flagAt === -1 ? undefined : Number(rest[flagAt + 1])
const root =
  rest.find((arg, i) => !arg.startsWith('--') && rest[i - 1] !== '--port') ??
  'docs'

async function main() {
  if (command === 'dev') {
    // VitePress disposes its code highlighter when a file the config imports
    // changes, then calls this restart hook. Without one the server keeps
    // running on a disposed highlighter, and every page it has not rendered
    // yet fails with "Shiki instance has been disposed".
    let restarting: Promise<void> | undefined
    const start = async (): Promise<void> => {
      const server = await createServer(root, { port }, () => {
        restarting ??= (async () => {
          await server.close()
          await start()
        })().finally(() => {
          restarting = undefined
        })
        return restarting
      })
      await server.listen()
      server.printUrls()
    }
    await start()
  } else if (command === 'build') {
    await build(root)
  } else if (command === 'preview') {
    await serve({ root, port })
  } else {
    console.error(USAGE)
    process.exit(command ? 1 : 0)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
