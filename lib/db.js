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
    // Asynchronously run database migrations once pool is created
    import("./db-update.js").then((m) => {
      m.runMigrations().catch((err) => {
        console.error("Failed to run migrations:", err);
      });
    });
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
