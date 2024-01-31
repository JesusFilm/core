import { BullModule } from '@nestjs/bull';
import { Global, Module, Provider } from '@nestjs/common';
import { FlowProducer } from 'bullmq';

import { BucketService } from '../../lib/bucket/bucketService';
import { GoogleSheetsService } from '../../lib/googleAPI/googleSheetsService';
import { GoogleOAuthService } from '../../lib/googleOAuth/googleOAuth';
import { PrismaService } from '../../lib/prisma.service';
import { YoutubeService } from '../../lib/youtube/youtubeService';
import { GoogleDriveModule } from '../google-drive/googleDrive.module';
import { GoogleDriveService } from '../google-drive/googleDriveService';

import { BullMQService } from './bullMQ.service';
import { UploadToBucket } from './consumers/uploadToBucket';
import { UploadToYoutube } from './consumers/uploadToYoutube';

export const FlowProducerProvider: Provider = {
  provide: 'FlowProducer',
  useFactory: () => {
    return new FlowProducer({
      connection: {
        host: 'redis',
        port: 6379,
      },
    });
  },
};

@Global()
@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'redis',
        port: 6379,
      },
    }),
    BullModule.registerQueue(
      {
        name: 'nexus-batches',
      },
      {
        name: 'nexus-youtube',
      },
      {
        name: 'nexus-bucket',
      },
    ),
    GoogleDriveModule,
  ],
  providers: [
    FlowProducerProvider,
    BullMQService,
    UploadToBucket,
    UploadToYoutube,
    GoogleDriveService,
    GoogleOAuthService,
    GoogleSheetsService,
    YoutubeService,
    BucketService,
    PrismaService,
  ],
  exports: [BullMQService],
})
export class BullMQModule {}
