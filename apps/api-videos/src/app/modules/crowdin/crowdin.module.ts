import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'

import { CrowdinConsumer } from './crowdin.consumer'
import { CrowdinService } from './crowdin.service'

@Module({
  imports: [BullModule.registerQueue({ name: 'api-videos-crowdin' })],
  providers: [CrowdinConsumer, CrowdinService, PrismaService]
})
export class CrowdinModule {}
