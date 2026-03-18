import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'

@Module({
  imports: [BullModule.registerQueue({ name: 'api-journeys-plausible' })],
  providers: []
})
export class PlausibleModule {}
