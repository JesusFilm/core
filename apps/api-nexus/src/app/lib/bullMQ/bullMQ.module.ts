import { BullModule } from '@nestjs/bull'
import { Global, Module } from '@nestjs/common'

import { BucketService } from '../bucket/bucket.service'
import { GoogleDriveService } from '../google/drive.service'
import { GoogleOAuthService } from '../google/oauth.service'
import { GoogleSheetsService } from '../google/sheets.service'
import { GoogleYoutubeService } from '../google/youtube.service'
import { PrismaService } from '../prisma.service'

import { BullMQService } from './bullMQ.service'
import { NexusBucketProcessor } from './consumers/nexusBucket.processor'
import { NexusYoutubeProcessor } from './consumers/nexusYoutube.processor'
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
    BullModule.registerQueue(
      { name: 'nexus-youtube' },
      { name: 'nexus-bucket' }
    )
  ],
  providers: [
    BullMQService,
    NexusBucketProcessor,
    NexusYoutubeProcessor,
    GoogleDriveService,
    GoogleOAuthService,
    GoogleSheetsService,
    GoogleYoutubeService,
    BucketService,
    PrismaService,
    NexusJobListener
  ],
  exports: [BullMQService]
})
export class BullMQModule {}
