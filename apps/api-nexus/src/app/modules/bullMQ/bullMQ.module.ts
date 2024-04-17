import { BullModule } from '@nestjs/bull'
import { Global, Module } from '@nestjs/common'

import { BucketService } from '../../lib/bucket/bucketService'
import { GoogleSheetsService } from '../../lib/googleAPI/googleSheetsService'
import { GoogleOAuthService } from '../../lib/googleOAuth/googleOAuth'
import { PrismaService } from '../../lib/prisma.service'
import { YoutubeService } from '../../lib/youtube/youtubeService'
import { GoogleDriveModule } from '../google-drive/googleDrive.module'
import { GoogleDriveService } from '../google-drive/googleDriveService'

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
    ),
    GoogleDriveModule
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
