import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'

import { PlausibleService } from './plausible.service'

@Module({
  imports: [BullModule.registerQueue({ name: 'api-journeys-plausible' })],
  providers: [PlausibleService]
})
export class PlausibleModule {}
