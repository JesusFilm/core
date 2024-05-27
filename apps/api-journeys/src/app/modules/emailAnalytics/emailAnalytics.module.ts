import { BullModule } from '@nestjs/bullmq'
import { Global, Module } from '@nestjs/common'

// TODO add providers once made

@Global()
@Module({
  imports: [BullModule.registerQueue({ name: 'api-journeys-email-analytics' })],
  providers: [],
  exports: []
})
export class SomeModule {}
