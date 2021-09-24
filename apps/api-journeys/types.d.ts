import { PrismaClient } from '.prisma/api-journeys-client'

declare global {
  namespace GraphQLModules {
    interface GlobalContext {
      db: PrismaClient
      userId?: string
    }
  }
  namespace NodeJS {
    interface Global {
      db: PrismaClient
    }
  }
}
