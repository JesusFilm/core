import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'

import { PlausibleConsumer } from './plausible.consumer'
import { PlausibleService } from './plausible.service'

@Module({
  imports: [BullModule.registerQueue({ name: 'api-journeys-plausible' })],
  providers: [PlausibleService, PrismaService, PlausibleConsumer]
})
export class PlausibleModule {}
