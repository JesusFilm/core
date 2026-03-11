import { Injectable, OnModuleInit } from '@nestjs/common'

import { PrismaClient, adapter } from '@core/prisma/journeys/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({ adapter })
  }

  async onModuleInit(): Promise<void> {
    await this.$connect()
  }
}
