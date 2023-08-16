import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common'

import { PrismaClient } from '.prisma/api-tags-client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    await this.$connect()
  }

  async enableShutdownHooks(app: INestApplication): Promise<void> {
    this.$on('beforeExit', (): void => {
      void app.close()
    })
  }
}
