import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'

import { BigQueryConsumer } from './bigQuery.consumer'
import { BigQueryQueue } from './bigQuery.queue'
import { BigQueryService } from './bigQuery.service'

@Module({
  imports: [BullModule.registerQueue({ name: 'api-videos-arclight' })],
  providers: [PrismaService, BigQueryConsumer, BigQueryQueue, BigQueryService]
})
export class BigQueryModule {}
