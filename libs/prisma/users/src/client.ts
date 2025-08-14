import { Prisma, PrismaClient } from '.prisma/api-users-client'

export * from '.prisma/api-users-client'
export { Prisma as PrismaUsers }
export { PrismaClient as PrismaClientUsers }

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()
export const prismaUsers = globalForPrisma.prisma || new PrismaClient()
