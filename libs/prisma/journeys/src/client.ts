import { Prisma, PrismaClient } from './.prisma/client'

export * from './.prisma/client'
export { PrismaClient as PrismaClientJourneys }
export { Prisma as PrismaJourneys }

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()
export const prismaJourneys = globalForPrisma.prisma || new PrismaClient()
