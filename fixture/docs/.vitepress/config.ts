import { defineNubiscoDocs } from '@nubisco/docs-sdk'

// A small site that uses the SDK exactly as a product would. CI builds it, so a
// change to the SDK that breaks a consumer fails here first.
export default defineNubiscoDocs({
  title: 'Fixture',
  description: 'A site that exercises @nubisco/docs-sdk.',
  base: '/',
  hostname: 'https://example.test/',
  repo: 'nubisco/docs-sdk',
  docsDir: 'fixture/docs/',
  analytics: false,
  nav: [
    { text: 'Guide', link: '/guide/getting-started' },
    { text: 'Widgets', link: '/widgets/widget/usage' },
  ],
  sidebar: {
    '/': [
      {
        text: 'Guide',
        items: [
          { text: 'Getting started', link: '/guide/getting-started' },
          { text: 'Writing pages', link: '/guide/writing-pages' },
          { text: 'Diagrams', link: '/guide/diagrams' },
        ],
      },
      {
        text: 'Widgets',
        items: [
          { text: 'Widget', link: '/widgets/widget/usage' },
          { text: 'Gadget', link: '/widgets/gadget/usage' },
        ],
      },
    ],
  },
  footer: {
    message:
      'Released under the <a href="https://github.com/nubisco/docs-sdk/blob/master/LICENSE">MIT License</a>.',
    copyright: 'Copyright © 2026 <a href="https://nubisco.io">Nubisco</a>',
  },
})
