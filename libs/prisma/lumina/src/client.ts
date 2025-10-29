import { PrismaClient } from '.prisma/api-lumina-client'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

export * from '.prisma/api-lumina-client'
export const prisma = globalForPrisma.prisma || new PrismaClient()
