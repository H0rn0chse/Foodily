/* eslint-env node */
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

export const {
  SERVER_PORT
} = process.env;
