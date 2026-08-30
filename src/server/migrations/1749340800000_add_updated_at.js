export const shorthands = undefined;

export function up(pgm) {
  pgm.sql(`
    ALTER TABLE dinners
      ADD COLUMN updated_at TIMESTAMP(6) DEFAULT NOW();

    ALTER TABLE users
      ADD COLUMN updated_at TIMESTAMP(6) DEFAULT NOW();

    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER dinners_set_updated_at
      BEFORE UPDATE ON dinners
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();

    CREATE TRIGGER users_set_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `);
}

export function down(pgm) {
  pgm.sql(`
    DROP TRIGGER IF EXISTS dinners_set_updated_at ON dinners;
    DROP TRIGGER IF EXISTS users_set_updated_at ON users;
    DROP FUNCTION IF EXISTS set_updated_at();

    ALTER TABLE dinners DROP COLUMN updated_at;
    ALTER TABLE users DROP COLUMN updated_at;
  `);
}
