import { Prisma, PrismaClient } from '.prisma/api-analytics-client'

export * from '.prisma/api-analytics-client'
export { PrismaClient as PrismaClientAnalytics }
export { Prisma as PrismaAnalytics }

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()
export const prismaAnalytics = globalForPrisma.prisma || new PrismaClient()
