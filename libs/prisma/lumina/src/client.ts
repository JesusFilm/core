import { Prisma, PrismaClient } from '.prisma/api-lumina-client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

export { Prisma }

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
