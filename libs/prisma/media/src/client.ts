import { Prisma, PrismaClient } from './.prisma/client'

export * from './.prisma/client'
export { Prisma as PrismaMedia }
export { PrismaClient as PrismaClientMedia }

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()
export const prismaMedia = globalForPrisma.prisma || new PrismaClient()
