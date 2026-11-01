# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.1.0] - 2026-11-02

### Security
- The rate limiter no longer trusts the client-controlled first `X-Forwarded-For` hop. Forwarded IPs are honoured only when `TRUST_PROXY=true`, and then only the last, proxy-appended entry. Previously, rotating the header bypassed login throttling.
- Link creation now caps the number of URLs, URL length and tag length (`MAX_URLS_PER_LINK`, `MAX_URL_LENGTH`, `MAX_TAG_LENGTH`).
- `DISABLE_AUTO_CREATE` and `HONEYPOT_FIELD` are now enforced on anonymous `/api/create`. They were previously defined but unused.

### Fixed
- The blocked-domain check matched substrings, so `microsoft.com`, `reddit.com` and others were rejected because they contain `t.co`. It now matches exact domains and their subdomains.

### Added
- `bun run create-superadmin <user> <pass>` script to bootstrap the first account.
- CI workflow that runs backend tests (against PostgreSQL) and the frontend build on every push and pull request.
- `development` image tag published from the `development` branch.
- This changelog.

### Changed
- Deployments behind a reverse proxy must set `TRUST_PROXY=true`, which `compose.yml` already does. Without it, all clients share the proxy's rate-limit bucket.
- Default branches are now `master` (release) and `development` (integration).
- README rewritten for the Bun/Elysia/Vite stack.
- Removed leftover Next.js config (`.eslintrc.json` and stale Next-era `.dockerignore` entries).
- Dependabot now tracks the Bun lockfiles and GitHub Actions.

## [2.0.0] - 2026-08

### Added
- Rewrite from Next.js to a Bun + Elysia + Prisma backend and a Vite React frontend.
- Superadmin role with user management. Public signup removed.
- In-process redirect cache, negative cache and buffered click counting.
- Security headers, constant-time login, rate limiting.
- All-in-one Docker image and GHCR publish workflow.

## [1.x]

- Original Next.js implementation.

[Unreleased]: https://github.com/c4lyp5o/pendek/compare/v2.1.0...development
[2.1.0]: https://github.com/c4lyp5o/pendek/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/c4lyp5o/pendek/releases/tag/v2.0.0
