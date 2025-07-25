/* eslint-env node */
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: join(__dirname, "../../../.env"),  quiet: true });

export const {
  SERVER_PORT
} = process.env;
