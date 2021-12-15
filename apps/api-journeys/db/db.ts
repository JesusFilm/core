import { Database } from 'arangojs'

export function ArangoDB(): Database {
  const db = new Database({ url: process.env.DATABASE_URL })
  db.useBasicAuth(process.env.DATABASE_USER, process.env.DATABASE_PASS)
  return db
}