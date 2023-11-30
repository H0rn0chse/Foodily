import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

const {
  NODE_ENV,
  SERVER_PORT,
  SERVER_MODE
} = process.env;
  
console.log(`Configuration: SERVER_PORT ${SERVER_PORT}`);
console.log(`Configuration: SERVER_MODE ${SERVER_MODE}`);
console.log(`Configuration: NODE_ENV ${NODE_ENV}`);

export default {};
