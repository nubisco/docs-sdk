# Security Policy

## Supported Versions

| Version | Supported         |
| ------- | ----------------- |
| 0.x     | Latest minor only |

## Reporting a Vulnerability

Please report suspected vulnerabilities privately.

- Preferred: GitHub private vulnerability reporting (Security tab)
- Alternative: email jose@nubisco.io with the subject `Security: nubisco-docs-sdk`

Please do not open public GitHub issues for security reports before disclosure is coordinated.

## What to Include

- Affected package version
- A clear description of the issue and impact
- Steps to reproduce or proof-of-concept details
- Relevant stack traces or configuration snippets
- Any suggested mitigation if known

## Scope

In scope:

- Injection through the theme: unescaped content from frontmatter, config or Markdown
  reaching the page (the footer and intro fields render limited HTML and Markdown)
- Unsafe defaults in the config helper that expose a built site or the machine building it
- The CLI running or reading something it was not asked to
- Dependency vulnerabilities with practical impact on this package

Out of scope:

- Vulnerabilities in unsupported versions
- Content a site author writes into their own pages
- Issues requiring unrealistic assumptions with no practical impact
- General hardening suggestions without a concrete vulnerability

## Response Expectations

This is a community-maintained open source project.

- We aim to acknowledge valid reports within 7 business days
- Triage and remediation timelines depend on severity and maintainer availability
- We may ask for additional details to validate and reproduce reports
- Credit can be provided in release notes unless you prefer to remain anonymous
