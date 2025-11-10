// db.js
import pkg from "pg";
import dotenv from "dotenv";
const { Pool } = pkg;

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Supabase
});

pool
  .connect()
  .then(() => console.log("Connected to Supabase PostgreSQL"))
  .catch((err) => console.error("Database connection failed:", err.message));

export default pool;
