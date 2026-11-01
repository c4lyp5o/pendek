# 🔗 pendek

A small, self-hosted URL shortener. *Pendek* is Malay for "short".

- **Backend:** [Bun](https://bun.sh) + [Elysia](https://elysiajs.com) + [Prisma](https://www.prisma.io) on PostgreSQL
- **Frontend:** React 19 + Vite, served as a static SPA by the backend
- **Shipped as:** one Docker image, `ghcr.io/c4lyp5o/pendek`

## Features

- Anonymous short links from the home page. You can turn this off with `DISABLE_AUTO_CREATE=true`.
- Accounts that can create custom codes (4–25 alphanumeric characters) and edit, disable or delete their links
- **Multi-links:** one code that opens a picker with several tagged destinations
- QR code for every link
- Click counting, buffered in memory and written to the database in batches
- Superadmin role that manages users. There is no public signup.
- Hardening: rate limiting, constant-time login, `http`/`https`-only URL validation, blocked shortener domains, input size caps, CSP and security headers, and a `Host` header allowlist for generated links

## Quick start (development)

Requirements: Bun ≥ 1.4 and PostgreSQL.

```bash
git clone https://github.com/c4lyp5o/pendek.git
cd pendek
bun run install            # installs backend + frontend deps

cp .env.example backend/.env
# edit backend/.env: set POSTGRES_URL and COOKIE_PASSWORD (openssl rand -hex 32)

cd backend
bun run db:push            # create/update the schema
bun run create-superadmin admin 'a-strong-password'
cd ..

bun run dev                # backend :5000 + Vite dev server
```

## Deploying with Docker

`compose.yml` runs the published image behind Traefik. Secrets come from a gitignored `.env` next to it:

```env
POSTGRES_URL=postgresql://user:password@db-host:5432/pendek
COOKIE_PASSWORD=<at least 32 random characters>
```

```bash
docker compose up -d
docker compose exec pendek bun scripts/create-superadmin.js admin 'a-strong-password'
```

The container applies the Prisma schema (`prisma db push`) on every start, then serves on port 5000.

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `POSTGRES_URL` | — (required) | PostgreSQL connection string |
| `COOKIE_PASSWORD` | — (required) | Session encryption key, at least 32 chars |
| `PORT` | `5000` | HTTP port |
| `BASE_URL` | `http://localhost:5000` | Fallback origin used in generated short URLs |
| `ALLOWED_HOSTS` | *(empty)* | Comma-separated extra hosts allowed in generated short URLs |
| `TRUST_PROXY` | `false` | Set `true` **only** behind a reverse proxy that appends `X-Forwarded-For`. The rate limiter then keys on the last (proxy-added) hop. |
| `DISABLE_AUTO_CREATE` | `false` | `true` disables anonymous link creation |
| `HONEYPOT_FIELD` | `company` | Body field that marks a bot submission if it is filled in |
| `MAX_URLS_PER_LINK` | `10` | Max destinations per link |
| `MAX_URL_LENGTH` | `2048` | Max length of a destination URL |
| `MAX_TAG_LENGTH` | `50` | Max length of a multi-link tag |
| `CODE_ALPHABET` / `CODE_LENGTH` | `23456789abcdefghijkmnpqrstuvwxyz` / `6` | Auto-generated code format |
| `COOKIE_NAME` / `COOKIE_TTL` | `pendek_session` / `604800` | Session cookie name and lifetime (s) |
| `LOGOUT_TIME` | `86400` | If set, sessions older than this (s) are forced to log in again |

## Testing

```bash
cd backend && bun test
```

The admin/end-to-end suite spawns a real server against a scratch database. It takes `POSTGRES_URL` and swaps `/pendek_dev` for `/pendek_test`, so that database must exist and have the schema pushed.

## Branches & releases

- `development` is the integration branch. Open pull requests against it.
- `master` is the release branch. Every push builds and publishes `ghcr.io/c4lyp5o/pendek:<version>` and `:latest`.

CI runs the test suite and the frontend build on every push and pull request. Versions follow [SemVer](https://semver.org). See [CHANGELOG.md](CHANGELOG.md).

## Contributing

1. Fork the repo and branch off `development`.
2. Make your change. Add tests and make sure `bun test` passes.
3. Open a pull request against `development`.

## License

[MIT](LICENSE) © 2023-2026 c4lyp5o
