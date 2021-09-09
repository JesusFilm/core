import { PrismaClient } from '.prisma/api-journeys-client';

<<<<<<< HEAD
const db = new PrismaClient();
=======
let db: PrismaClient

if (process.env.NODE_ENV === 'production') {
  db = new PrismaClient()
} else {
  if (global.db === undefined) {
    global.db = new PrismaClient()
  }

  db = global.db
}
>>>>>>> origin/main

export default db;
