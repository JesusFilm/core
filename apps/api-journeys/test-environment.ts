
import NodeEnvironment = require('jest-environment-node')
import { PrismaClient } from '.prisma/api-journeys-client'

class PrismaTestEnvironment extends NodeEnvironment {
  private readonly prisma: PrismaClient
  private tablenames?: Array<{ tablename: string }>
  constructor (config) {
    super(config)

    this.prisma = new PrismaClient()
    this.tablenames = []
  }

  async setup (): Promise<void> {
    await super.setup()
    await this.truncate()
  }

  async teardown (): Promise<void> {
    await super.teardown()
    await this.truncate()
  }

  private async truncate (): Promise<void> {
    this.tablenames = await this.prisma.$queryRaw(
      'SELECT tablename FROM pg_tables WHERE schemaname=\'public\''
    )

    await this.tablenames?.map(async ({ tablename }) => {
      if (tablename === '_prisma_migrations') {
        return await Promise.resolve()
      }

      return await this.prisma.$queryRaw(
        `TRUNCATE TABLE public."${tablename}" CASCADE;`
      )
    })
  }
}

module.exports = PrismaTestEnvironment
