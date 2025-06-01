import { Prisma, PrismaClient } from './.prisma/client'

export * from './.prisma/client'
export { Prisma as PrismaUsers }
export { PrismaClient as PrismaClientUsers }

export const prisma = new PrismaClient()
export const prismaUsers = new PrismaClient()
