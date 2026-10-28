---
layout: nubisco
title: Writing pages
status: beta
intro: 'Frontmatter fields: `title`, `intro`, `status`, `source`, and `pageTabs` for pages with facets.'
source: src/theme/Nubisco.vue
---

## Frontmatter

`layout: nubisco` opts a page into the Nubisco layout. `intro` is one paragraph of
inline Markdown shown on every tab. `status` adds a badge.

## Tabs are pages

A page with facets is one file per tab. Each lists its siblings in `pageTabs` and names
its own with `tab`.
