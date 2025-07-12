import dotenv from "dotenv";
dotenv.config({ path: "../../.env",  quiet: true  });

const {
  NODE_ENV,
  SERVER_PORT,
  SERVER_MODE,
  DB_CONNECTION_STRING
} = process.env;
  
console.log(`Configuration: SERVER_PORT ${SERVER_PORT}`);
console.log(`Configuration: SERVER_MODE ${SERVER_MODE}`);
console.log(`Configuration: NODE_ENV ${NODE_ENV}`);
console.log(`Configuration: DB_CONNECTION_STRING ${DB_CONNECTION_STRING}`);

export default {};
