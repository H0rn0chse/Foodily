import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

console.log("foo");
console.log(process.env.SECRET);

export default {};
