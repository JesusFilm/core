import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'

import { BigQueryConsumer } from './bigQuery.consumer'
// TODO: uncomment and add queue to providers when seed has been replaced
// import { BigQueryQueue } from './bigQuery.queue'
import { BigQueryService } from './bigQuery.service'

@Module({
  imports: [BullModule.registerQueue({ name: 'api-videos-arclight' })],
  providers: [PrismaService, BigQueryConsumer, BigQueryService]
})
export class BigQueryModule {}
