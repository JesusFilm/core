import { BullModule } from '@nestjs/bull';
import { Global, Module, Provider } from '@nestjs/common';
import { FlowProducer } from 'bullmq';

import { BucketService } from '../../lib/bucket/bucketService';
import { GoogleDriveService } from '../../lib/googleAPI/googleDriveService';

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
  ],
  providers: [
    FlowProducerProvider,
    BullMQService,
    UploadToBucket,
    UploadToYoutube,
    GoogleDriveService,
    BucketService,
  ],
  exports: [BullMQService],
})
export class BullMQModule {}
