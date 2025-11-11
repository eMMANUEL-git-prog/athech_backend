// db.js
import pkg from "pg";
import dotenv from "dotenv";
const { Pool } = pkg;

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Supabase
  max: 10, // max number of clients in pool
  idleTimeoutMillis: 30000, // close idle clients after 30s
  connectionTimeoutMillis: 5000, // give up if cannot connect in 5s
});

// Test connection safely
(async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("✅ Connected to Supabase PostgreSQL");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
})();

export default pool;
