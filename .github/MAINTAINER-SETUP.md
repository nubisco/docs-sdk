# Maintainer Setup Checklist

Repository settings that must be configured in GitHub and npm, not in code.

## First npm release (one time, by hand)

npm can only attach a Trusted Publisher to a package that already exists, so the
first version is published manually:

1. Check out `master`, run `pnpm install --frozen-lockfile` and `pnpm run quality:check`.
2. Run `npm login`, then `npm publish --access public` (version `0.0.0` as committed).
3. On npmjs.com, open the package, then Settings, then Trusted Publisher, and add this
   repository: owner `nubisco`, repository `docs-sdk`, workflow `release.yml`,
   environment `production`.
4. From then on every release is made by the `Release` workflow. Nobody publishes by hand.

## Secrets and environments

- Create the GitHub Actions environment `production`.
- Add the repository secret `GH_TOKEN`: a token that can push to `master` and create
  releases (semantic-release uses it to commit the changelog and tag).

## Branch Protection (default branch: `master`)

- Protect `master`
- Require pull request before merge, and status checks to pass
- Require conversation resolution before merge (recommended)
- Disable force pushes and branch deletion
- Allow the release token to bypass the pull request rule, knowingly: semantic-release
  pushes the `chore(release)` commit directly

## Security and Dependency Settings

- Enable Dependabot alerts and security updates
- Enable private vulnerability reporting
- Keep CodeQL enabled (configured in `.github/workflows/codeql-analysis.yml`)

## Community Settings

- Verify `SECURITY.md`, `CODE_OF_CONDUCT.md` and `FUNDING.yml` are active
- Set the issue templates as the default intake flow
