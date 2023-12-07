import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ApiJourneysEmailConsumer } from './modules/apiJourneysEmail/apiJourneysEmail.consumer'

@Module({
  imports: [
    ApiJourneysEmailConsumer,
    BullModule.forRoot({
      connection: {
        host: 'redis',
        port: 6379
      }
    }),
    BullModule.registerQueue({ name: 'api-journeys-email' })
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
