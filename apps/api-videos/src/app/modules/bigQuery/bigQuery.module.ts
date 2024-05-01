import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'
import { ImporterModule } from '../importer/importer.module'

import { BigQueryConsumer } from './bigQuery.consumer'
import { BigQueryService } from './bigQuery.service'

@Module({
  imports: [
    BullModule.registerQueue({ name: 'api-videos-arclight' }),
    ImporterModule
  ],
  providers: [PrismaService, BigQueryConsumer, BigQueryService]
})
export class BigQueryModule {}
