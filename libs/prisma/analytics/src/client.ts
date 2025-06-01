import { Prisma, PrismaClient } from './.prisma/client'

export * from './.prisma/client'
export { PrismaClient as PrismaClientAnalytics }
export { Prisma as PrismaAnalytics }

export const prisma = new PrismaClient()
export const prismaAnalytics = new PrismaClient()
