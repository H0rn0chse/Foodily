// import crypto from "crypto";
import pg from "pg";
import { init } from "./schema";
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

await init(client);

export type UserRow = {
    id: number,
    username: string,
    hashed_password: Buffer,
    salt: Buffer
};

// await client.end();

export default client;

