import crypto from "crypto";
import { Client } from "pg";

export async function init (client: Client) {
  await dropAllTables(client);
  await createTables(client);
  console.log("✅ Database schema applied");
  await addTestData(client);
}

async function dropAllTables (client: Client) {
  await [
    "users",
    "userPreferences"
  ].reduce(async (promise, tableName) => {
    await promise;
    await client.query(`DROP TABLE IF EXISTS ${tableName} CASCADE`);
  }, Promise.resolve());
}

async function createTables (client: Client) {
  await client.query("CREATE TABLE IF NOT EXISTS users ( \
    id SERIAL PRIMARY KEY, \
    username TEXT UNIQUE, \
    hashed_password BYTEA, \
    salt BYTEA \
  )");

  await client.query("CREATE TABLE IF NOT EXISTS userPreferences ( \
    id INT GENERATED ALWAYS AS IDENTITY, \
    user_id INT REFERENCES users(id), \
    language TEXT \
  )");
}

async function addTestData (client: Client) {
  const salt = crypto.randomBytes(16);
  await client.query(
    "INSERT INTO users (username, hashed_password, salt) \
    VALUES ($1, $2, $3) \
    ON CONFLICT (username) \
    DO NOTHING",
    [
      "admin",
      crypto.pbkdf2Sync("1234", salt, 310000, 32, "sha256"),
      salt
    ]
  );
  console.log("✅ Initial User created");

  await client.query(
    "INSERT INTO userPreferences(user_id, language)\
    VALUES($1, $2)",
    [
      1,
      "en"
    ]
  );
}
