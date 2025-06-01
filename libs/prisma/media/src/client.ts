import { Prisma, PrismaClient } from './.prisma/client'

export * from './.prisma/client'
export { Prisma as PrismaMedia }
export { PrismaClient as PrismaClientMedia }

export const prisma = new PrismaClient()
export const prismaMedia = new PrismaClient()
