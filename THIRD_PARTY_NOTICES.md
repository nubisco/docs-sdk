# Third-party notices

`@nubisco/docs-sdk` is released under the MIT License (see `LICENSE`). It contains code
adapted from the projects below, and it is used with the fonts and libraries listed at
the end. Each keeps its own licence and copyright, reproduced here as those licences
require.

## Code adapted into this package

### vitepress-plugin-tabs

Adapted into `src/plugins/tabs/` (the tabs markdown rule and the tab components).
Source: https://github.com/sapphi-red/vitepress-plugins (package `vitepress-plugin-tabs`, MIT).

```
MIT License

Copyright (c) 2022 sapphi-red

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### vitepress-plugin-mermaid

Adapted into `src/plugins/mermaid/` (the mermaid markdown rule, the Vite plugin and the
diagram component). Source: https://github.com/emersonbottero/vitepress-plugin-mermaid
(package `vitepress-plugin-mermaid`, MIT).

```
MIT License

Copyright (c) 2022 emersonbottero

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Design reference (no code taken)

The layout draws on the structure of the documentation of IBM's Carbon Design System
(https://carbondesignsystem.com), which is the work of IBM and its contributors and is
licensed under Apache 2.0. This package contains none of Carbon's code, assets or marks.
"Carbon" and "IBM" are trademarks of International Business Machines Corporation.

## Dependencies

Installed with this package, not copied into it. Their licences travel with them.

| Package | Licence |
| --- | --- |
| `vitepress`, `vue`, `vite`, `mermaid`, `vite-svg-loader`, `vitepress-plugin-group-icons`, `markdown-it-container`, `sass-embedded` | MIT |
| `@nubisco/ui` (peer dependency) | MIT |
| `@fontsource/plus-jakarta-sans` (Plus Jakarta Sans) | SIL Open Font License 1.1 |
| `@fontsource/fira-code` (Fira Code) | SIL Open Font License 1.1 |

### Fonts

The sites this package builds serve Plus Jakarta Sans (Copyright 2020 The Plus Jakarta
Sans Project Authors, https://github.com/tokotype/PlusJakartaSans) and Fira Code
(Copyright 2014-2020 The Fira Code Project Authors, https://github.com/tonsky/FiraCode),
both under the SIL Open Font License, Version 1.1
(https://openfontlicense.org). The fonts are not part of this package's own files: they
come from the `@fontsource` packages, which carry the full licence text. A site that
republishes the font files keeps that licence file with them.

### Icons

The icons the theme draws come from `@nubisco/ui`, which builds them from Phosphor Icons
(https://phosphoricons.com, MIT, Copyright (c) 2023 Phosphor Icons).
