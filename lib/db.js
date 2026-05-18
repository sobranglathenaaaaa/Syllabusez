import mysql from "mysql2/promise";

let pool;
let warnedMissingUrl = false;

export function getDbPool() {
  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV !== "production" && !warnedMissingUrl) {
      warnedMissingUrl = true;
      console.warn("DATABASE_URL is not configured; database operations will run in no-op mode.");
    }
    return null;
  }

  if (!pool) {
    pool = mysql.createPool(process.env.DATABASE_URL);
  }

  return pool;
}

export async function query(sql, values = []) {
  const db = getDbPool();
  if (!db) {
    return [];
  }

  const [rows] = await db.query(sql, values);
  return rows;
}
