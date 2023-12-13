import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'

import { EmailConsumer } from './modules/email/email.consumer'
import { NestHealthController } from './modules/health/health.controller'

@Module({
  imports: [
    EmailConsumer,
    BullModule.forRoot({
      connection: {
        host: 'redis',
        port: 6379
      }
    }),
    BullModule.registerQueue({ name: 'api-journeys-email' })
  ],
  controllers: [NestHealthController],
  providers: []
})
export class AppModule {}
