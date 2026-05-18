import mysql from "mysql2/promise";

let pool;

export function getDbPool() {
  if (!process.env.DATABASE_URL) {
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
