import { Prisma, PrismaClient } from '.prisma/api-languages-client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export * from '.prisma/api-languages-client'
export const prisma = globalForPrisma.prisma || new PrismaClient()
