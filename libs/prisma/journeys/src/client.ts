import { Prisma, PrismaClient } from '.prisma/api-journeys-client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export * from '.prisma/api-journeys-client'
export const prisma = globalForPrisma.prisma || new PrismaClient()
