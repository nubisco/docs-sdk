# Contributing

Thanks for contributing to `@nubisco/docs-sdk`.

## Local Setup

```bash
git clone https://github.com/nubisco/docs-sdk.git
cd docs-sdk
pnpm install
```

## Development Commands

```bash
pnpm run dev            # build the SDK, then serve the fixture site
pnpm test
pnpm run types:check
pnpm run format:check
pnpm run docs:build     # build the SDK, then build the fixture site with it
pnpm run quality:check  # all of the above
```

Notes:

- Minimum supported Node.js version is `22`
- Vue compatibility is `^3.5.0`, and `@nubisco/ui` is a peer dependency

## What this package is

The Nubisco documentation design, shipped as one package: VitePress, the theme, the
plugins (tabs, mermaid) and `defineNubiscoDocs`, so a product supplies only its
content. The design is a fleet standard: a change to how the header, sidebar or
outline look and behave reaches every product that uses this, so keep changes
deliberate and show them in the fixture site.

## Contributor License Agreement (CLA)

To keep Nubisco projects sustainable and legally consistent, all contributions are made
under the Individual CLA:

- See `docs/CLA-INDIVIDUAL.md`
- You retain ownership of your work
- You grant Nubisco rights to use, distribute, and relicense contributions, including for commercial distributions

By opening a pull request, you must explicitly confirm you agree to the CLA in the pull
request template.

## Branch and PR Expectations

- Create focused branches (one concern per PR)
- Keep pull requests small and reviewable
- Use Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`, `ci:`)
- Run `pnpm run quality:check` before opening a PR
- Confirm CLA agreement in the PR checklist

## Third-party code

Anything copied or adapted from another project needs its licence and copyright line in
`THIRD_PARTY_NOTICES.md` in the same pull request. Do not merge code whose licence is
not compatible with MIT.

## Coding Style

- TypeScript strict mode
- 2-space indentation, LF line endings, no semicolons, single quotes
- Keep the public surface small: options and exports are a contract for every product

## Issue Routing

- Use **Bug report** for regressions and reproducible defects
- Use **Feature request** for new options, theme behaviour or plugins
- Include a minimal reproduction in all bug reports
