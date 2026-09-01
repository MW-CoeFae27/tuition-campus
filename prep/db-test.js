import "dotenv/config";
import pg from "pg";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const { rows } = await pool.query("SELECT NOW() AS now");
console.log(rows[0]);
await pool.end();
