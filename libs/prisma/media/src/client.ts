import { Prisma, PrismaClient } from '.prisma/api-media-client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export * from '.prisma/api-media-client'
export const prisma = globalForPrisma.prisma || new PrismaClient()
