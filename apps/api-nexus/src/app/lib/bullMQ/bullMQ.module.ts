import { BullModule } from '@nestjs/bull'
import { Global, Module } from '@nestjs/common'

import { BatchService } from '../../modules/batch/batch.service'
import { FileService } from '../file/file.service'
import { SpreadSheetsService } from '../file/sheets.service'
import { GoogleOAuthService } from '../google/oauth.service'
import { GoogleYoutubeService } from '../google/youtube.service'
import { PrismaService } from '../prisma.service'

import { BullMQService } from './bullMQ.service'
import { BatchJobWorker } from './consumers/batch.job.worker'
import { NexusJobListener } from './listener/jobListener'

@Global()
@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: 6379
      }
    }),
    BullModule.registerQueue({ name: 'nexus-batch-worker' })
  ],
  providers: [
    BullMQService,
    BatchJobWorker,
    GoogleOAuthService,
    SpreadSheetsService,
    FileService,
    GoogleYoutubeService,
    BatchService,
    PrismaService,
    NexusJobListener
  ],
  exports: [BullMQService]
})
export class BullMQModule {}
