import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'

import { AlgoliaConsumer } from './algolia.consumer'
import { AlgoliaQueue } from './algolia.queue'
import { AlgoliaService } from './algolia.service'

@Module({
  imports: [BullModule.registerQueue({ name: 'api-journeys-algolia' })],
  providers: [AlgoliaConsumer, AlgoliaQueue, AlgoliaService, PrismaService]
})
export class AlgoliaModule {}
