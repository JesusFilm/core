import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common'
import { PrismaClient } from '.prisma/api-users-client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async onModuleInit() {
    await this.$connect()
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async enableShutdownHooks(app: INestApplication) {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.$on('beforeExit', async () => {
      await app.close()
    })
  }
}