import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';

import { BucketService } from '../../lib/bucket/bucketService';
import { GoogleSheetsService } from '../../lib/googleAPI/googleSheetsService';
import { GoogleOAuthService } from '../../lib/googleOAuth/googleOAuth';
import { PrismaService } from '../../lib/prisma.service';
import { YoutubeService } from '../../lib/youtube/youtubeService';
import { GoogleDriveModule } from '../google-drive/googleDrive.module';
import { GoogleDriveService } from '../google-drive/googleDriveService';

import { BullMQService } from './bullMQ.service';
import { BatchJobWorker } from './consumers/batch.job.worker';
import { JobListener } from './listener/job.listener';

@Global()
@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: 6379,
      },
    }),
    BullModule.registerQueue(
      {
        name: 'nexus-batch-job',
      }
    ),
    GoogleDriveModule,
  ],
  providers: [
    BatchJobWorker,
    PrismaService,
    BullMQService,
    GoogleDriveService,
    GoogleOAuthService,
    GoogleSheetsService,
    YoutubeService,
    BucketService,
    JobListener,
  ],
  exports: [BullMQService],
})
export class BullMQModule {}
