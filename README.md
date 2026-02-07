# Foodily

## Local Development

### npm scripts

- `npm run dev`
  <br>Starts the Vite dev server (with HMR) alongside the backend without authentication (`SERVER_AUTH=false`, `SERVER_UI=none`). Best for fast frontend iteration.
- `npm run dev:server-pages`
  <br>Starts the server with authentication enabled, serving static HTML pages from the server's `pages/` folder (`SERVER_UI=server-pages`).
- `npm run dev:server-client`
  <br>Builds both frontend apps, then starts the server with authentication enabled, serving the pre-built Vite bundles (`SERVER_UI=client-dist`). Closest to production.

### Server configuration

The server is configured via two independent environment variables. Both are **ignored in production** where safe defaults are always enforced.

| Variable      | Values                                  | Default       | Production           |
| ------------- | --------------------------------------- | ------------- | -------------------- |
| `SERVER_AUTH` | `true` / `false`                        | `true`        | Always `true`        |
| `SERVER_UI`   | `client-dist` / `server-pages` / `none` | `client-dist` | Always `client-dist` |

- **`SERVER_AUTH`** — Enable or disable authentication. When disabled, all requests use a static test user.
- **`SERVER_UI`** — Which UI assets the server should serve:
  - `client-dist` — Pre-built Vite client bundles (default)
  - `server-pages` — Static HTML pages from the server's `pages/` folder
  - `none` — No UI, API endpoints only

### Docker

- `npm run start:db`
  <br>Starts the database
