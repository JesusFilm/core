import { Prisma, PrismaClient } from './.prisma/client'

export * from './.prisma/client'
export { Prisma as PrismaLanguages }
export { PrismaClient as PrismaClientLanguages }

export const prisma = new PrismaClient()
export const prismaJourneys = new PrismaClient()
