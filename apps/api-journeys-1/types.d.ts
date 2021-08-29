import { PrismaClient } from '.prisma/api-journeys-1-client'

declare global {
  namespace GraphQLModules {
    interface GlobalContext {
      db: PrismaClient
    }
  }
}
