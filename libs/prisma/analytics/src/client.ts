import { Prisma, PrismaClient } from '.prisma/api-analytics-client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export * from '.prisma/api-analytics-client'
export const prisma = globalForPrisma.prisma || new PrismaClient()
