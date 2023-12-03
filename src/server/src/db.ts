import crypto from "crypto";
import pg from "pg";
const { Client } = pg;

const {
  DB_CONNECTION_STRING
} = process.env;

// const connectionString = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
console.log(DB_CONNECTION_STRING);
 
const client = new Client({
  connectionString: DB_CONNECTION_STRING || ""
});
await client.connect();

console.log("✅ Database connected");

await client.query("CREATE TABLE IF NOT EXISTS users ( \
    id SERIAL PRIMARY KEY, \
    username TEXT UNIQUE, \
    hashed_password BYTEA, \
    salt BYTEA \
  )");

console.log("✅ Database schema applied");

export type UserRow = {
    id: number,
    username: string,
    hashed_password: Buffer,
    salt: Buffer
};

// create an initial user (username: alice, password: letmein)
const salt = crypto.randomBytes(16);
client.query("INSERT INTO users (username, hashed_password, salt) \
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

// await client.end();

export default client;

