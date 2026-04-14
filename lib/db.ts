import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

export const sql = neon(process.env.DATABASE_URL)

// Helper function for transactions
export async function withTransaction<T>(
  callback: (sql: typeof import("@neondatabase/serverless").neon) => Promise<T>
): Promise<T> {
  return callback(neon(process.env.DATABASE_URL!))
}
