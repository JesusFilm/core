import { PrismaClient } from '.prisma/api-journeys-client'

let db

if (process.env.NODE_ENV === 'production') {
  db = new PrismaClient()
} else {
  if (global.db != null) {
    global.db = new PrismaClient()
  }

  db = global.db
}

export default db
