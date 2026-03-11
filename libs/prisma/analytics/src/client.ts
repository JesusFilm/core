import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from './__generated__/client/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const adapter = new PrismaPg({
  connectionString: process.env['PG_DATABASE_URL_ANALYTICS']!
})

export * from './__generated__/client/client'
export const prisma =
  globalForPrisma.prisma ??
  (globalForPrisma.prisma = new PrismaClient({ adapter }))
