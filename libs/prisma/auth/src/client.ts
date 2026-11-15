import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from './__generated__/client/client'

export { Prisma, PrismaClient } from './__generated__/client/client'

export function createAuthDatabase(connectionString: string): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000,
      options:
        '-c statement_timeout=5000 -c lock_timeout=3000 -c idle_in_transaction_session_timeout=10000'
    })
  })
}
