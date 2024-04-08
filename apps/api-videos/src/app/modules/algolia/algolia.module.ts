import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'

import { AlgoliaConsumer } from './algolia.consumer'
import { AlgoliaQueue } from './algolia.queue'
import { AlgoliaService } from './algolia.service'

@Module({
  imports: [BullModule.registerQueue({ name: 'api-videos-aloglia' })],
  providers: [AlgoliaConsumer, AlgoliaQueue, AlgoliaService]
})
export class AlgoliaModule {}
