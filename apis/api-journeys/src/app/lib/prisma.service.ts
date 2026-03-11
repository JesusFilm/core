import { Injectable, OnModuleInit } from '@nestjs/common'

import { PrismaClient } from '@core/prisma/journeys/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env['PG_DATABASE_URL_JOURNEYS']!
})

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({ adapter })
  }

  async onModuleInit(): Promise<void> {
    await this.$connect()
  }
}
