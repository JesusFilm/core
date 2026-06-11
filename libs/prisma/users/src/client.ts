import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from './__generated__/client/client'

const globalForPrisma = global as unknown as { prismaUsers: PrismaClient }

const adapter = new PrismaPg({
  connectionString: process.env['PG_DATABASE_URL_USERS']!,
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 10_000
})

export * from './__generated__/client/client'
export const prisma =
  globalForPrisma.prismaUsers ??
  (globalForPrisma.prismaUsers = new PrismaClient({ adapter }))
