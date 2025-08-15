import { Prisma, PrismaClient } from '.prisma/api-users-client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export * from '.prisma/api-users-client'
export const prisma = globalForPrisma.prisma || new PrismaClient()
