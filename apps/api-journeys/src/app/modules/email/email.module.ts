import { BullModule } from '@nestjs/bullmq'
import { Global, Module } from '@nestjs/common'

import { EmailConsumer } from './email.consumer'

@Global()
@Module({
  imports: [BullModule.registerQueue({ name: 'api-journeys-email' })],
  providers: [EmailConsumer],
  exports: []
})
export class EmailModule {}
