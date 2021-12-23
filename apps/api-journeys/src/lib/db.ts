import { PrismaClient } from '.prisma/api-journeys-client'

let db: PrismaClient

if (process.env.NODE_ENV === 'production') {
  db = new PrismaClient()
} else {
  if (global.db === undefined) {
    global.db = new PrismaClient()
  }

  db = global.db
}

const dbExport = db

export default dbExport
