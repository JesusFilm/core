import { Prisma, PrismaClient } from './.prisma/client'

export * from './.prisma/client'
export { Prisma as PrismaLanguages }
export { PrismaClient as PrismaClientLanguages }

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()
export const prismaLanguages = globalForPrisma.prisma || new PrismaClient()
