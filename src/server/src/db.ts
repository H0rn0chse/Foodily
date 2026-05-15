// import crypto from "crypto";
import pg from "pg";
import { resolve } from "node:path";
import { runner } from "node-pg-migrate";
import { seedLocalTestData } from "./testDataSeed.js";
const { Client } = pg;

const {
  DB_CONNECTION_STRING,
  NODE_ENV,
  DB_RESET_ON_START,
  DB_SEED_ON_START
} = process.env;

// const connectionString = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
console.log(DB_CONNECTION_STRING);
 
const client = new Client({
  connectionString: DB_CONNECTION_STRING || ""
});
await client.connect();

console.log("✅ Database connected");

const isNonProduction = NODE_ENV !== "production";

if (isNonProduction && DB_RESET_ON_START === "true") {
  console.log("⚠️ DB_RESET_ON_START=true -> dropping schema and rerunning migrations");
  await client.query("DROP SCHEMA IF EXISTS public CASCADE");
  await client.query("CREATE SCHEMA public");

  await runner({
    databaseUrl: DB_CONNECTION_STRING || "",
    dir: resolve(process.cwd(), "migrations"),
    direction: "up",
    migrationsTable: "pgmigrations",
    migrationsSchema: "public",
  });

  await seedLocalTestData(client);
} else {
  if (isNonProduction && DB_SEED_ON_START === "true") {
    console.log("🌱 DB_SEED_ON_START=true -> seeding local test data if database is empty");
    await seedLocalTestData(client);
  }
}

// await client.end();

export function buildSetStatement (newData: object, indexOffset: number = 1) {
  const columnsToUpdate = Object.keys(newData).filter((key) => {
    const value = newData[key as keyof typeof newData];
    return value !== null && value !== undefined;
  });
  const setArguments = columnsToUpdate.map((key, index) => {
    const escapedValue = `$${index+indexOffset}`;
    return `${key}=${escapedValue}`;
  });
  const setStatement = `SET ${setArguments.join(", ")}`;

  const newValues = columnsToUpdate.map<unknown>((key) => {
    return newData[key as keyof typeof newData];
  });
  return {
    setArguments,
    setStatement,
    newValues,
  };
}

export default client;

