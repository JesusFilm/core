import { Prisma, PrismaClient } from './.prisma/client'

export * from './.prisma/client'
export { PrismaClient as PrismaClientJourneys }
export { Prisma as PrismaJourneys }

export const prisma = new PrismaClient()
export const prismaJourneys = new PrismaClient()
