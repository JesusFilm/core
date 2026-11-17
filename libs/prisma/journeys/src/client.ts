import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from './__generated__/client/client'

import { journeyTransactionScope } from './transactionScope'

const globalForPrisma = global as unknown as { prismaJourneys: PrismaClient }

const adapter = new PrismaPg({
  connectionString: process.env['PG_DATABASE_URL_JOURNEYS']!,
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 10_000
})

export * from './__generated__/client/client'
const root =
  globalForPrisma.prismaJourneys ??
  (globalForPrisma.prismaJourneys = new PrismaClient({ adapter }))

// Cooperative permission mutations route their existing resolver queries through
// the transaction holding the durable permission receipt. Nested transactions
// join that transaction, so their writes cannot escape its commit or rollback.
export function transactionScopedJourneyClient(
  client: PrismaClient
): PrismaClient {
  return new Proxy(client, {
    get(target, property) {
      const transaction = journeyTransactionScope.getStore()
      if (transaction && property === '$transaction')
        return (operation: unknown) =>
          typeof operation === 'function'
            ? operation(transaction)
            : Promise.all(operation as Promise<unknown>[])
      const current = transaction ?? target
      const value: unknown = Reflect.get(current, property)
      return typeof value === 'function' ? value.bind(current) : value
    }
  })
}

export const prisma = transactionScopedJourneyClient(root)

export {
  journeyTransactionScope,
  journeyAfterCommitScope,
  deferJourneyTransactionEffect
} from './transactionScope'
