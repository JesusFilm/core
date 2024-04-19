import { BullModule } from '@nestjs/bull'
import { Global, Module } from '@nestjs/common'

import { BucketService } from '../bucket/bucketService'
import { GoogleDriveService } from '../google/drive.service'
import { GoogleOAuthService } from '../google/oauth.service'
import { GoogleSheetsService } from '../google/sheets.service'
import { PrismaService } from '../prisma.service'
import { YoutubeService } from '../youtube/youtubeService'

import { BullMQService } from './bullMQ.service'
import { UploadToBucket } from './consumers/uploadToBucket'
import { UploadToYoutube } from './consumers/uploadToYoutube'
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
      {
        name: 'nexus-batches'
      },
      {
        name: 'nexus-youtube'
      },
      {
        name: 'nexus-bucket'
      }
    )
  ],
  providers: [
    BullMQService,
    UploadToBucket,
    UploadToYoutube,
    GoogleDriveService,
    GoogleOAuthService,
    GoogleSheetsService,
    YoutubeService,
    BucketService,
    PrismaService,
    NexusJobListener
  ],
  exports: [BullMQService]
})
export class BullMQModule {}
