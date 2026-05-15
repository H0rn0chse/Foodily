## Database Strategy

The server uses versioned database migrations as the only schema source of truth.

1. Schema management via migrations (`migrations/*` with `node-pg-migrate`).
2. Optional local test-data seeding (`src/testDataSeed.ts`).

### Local Development

Use environment flags from the project `.env`:

- `DB_RESET_ON_START=true`: drops the `public` schema, reruns all migrations, then reseeds local test data (destructive).
- `DB_SEED_ON_START=true`: seeds local test data only if the database is empty.

Recommended defaults:

- `DB_RESET_ON_START=false`
- `DB_SEED_ON_START=true`

### Migrations (Production-safe)

Migrations live in `src/server/migrations`.

Available scripts in `src/server/package.json`:

- `npm run migrate:up`
- `npm run migrate:down`
- `npm run migrate:redo`
- `npm run migrate:create -- <name>`

The Docker image now runs `npm run migrate:up` before starting the server.

## Suggested Rollout

1. Keep local reset/seed helpers for development convenience.
2. Use migrations as the source of truth for all schema changes.
3. For each schema change, add a new migration file and deploy normally.
