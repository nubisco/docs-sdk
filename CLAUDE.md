# @nubisco/docs-sdk

The one implementation of the Nubisco documentation design. Every product's docs are built
on it, so a change here reaches all of them.

Read the workspace standards first: `../CLAUDE.md` and, in `../AGENTS.md`, "Documentation
sites (VitePress)". They say who is expected to be on this package and how a product moves
onto it. `MIGRATING.md` is the guide for that move.

- The Node side is compiled with tsup. The theme (`src/theme`) ships as source and is
  compiled by the consuming site.
- Keep it product-agnostic: nothing here may name a product or carry a product's content.
  What only one product needs belongs in that product.
- `pnpm run quality:check` must pass. CI also builds `fixture/docs`.
- Releases are semantic-release from conventional commits, published by CI with npm trusted
  publishing. Never publish by hand.
