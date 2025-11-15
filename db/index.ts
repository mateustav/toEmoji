import { Pool } from "pg";

export default async function getDbPool(): Promise<Pool> {
  const pool = new Pool();
  return pool;
}
