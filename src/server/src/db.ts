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

