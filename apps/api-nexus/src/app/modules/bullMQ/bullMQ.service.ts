import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import Bull, { Queue } from 'bull';

export interface UploadToYoutbeTask {
  channelId: string;
  refreshToken: string;
}

export interface UploadToBucketTask {
  driveId: string;
  refreshToken: string;
}

export interface UploadYoutubeTemplateTask {
  resource: {
    driveId: string;
    refreshToken: string;
  };
  channel: {
    channelId: string;
    refreshToken: string;
  };
}

export interface UploadToBucketToYoutube {
  batchId: string;
  resource: {
    driveId: string;
    refreshToken: string;
  };
  channel: {
    channelId: string;
    refreshToken: string;
  };
}

@Injectable()
export class BullMQService {
  constructor(
    @InjectQueue('nexus-bucket') private readonly bucketQueue: Queue,
  ) {}

  async createBatchJob(
    batch: { id: string; batchName: string },
    resources: UploadYoutubeTemplateTask[],
  ): Promise<Array<Bull.Job<unknown>>> {
    return await this.bucketQueue.addBulk(
      resources.map((item) => {
        return {
          name: 'process',
          data: {
            batchId: batch.id,
            resource: item.resource,
            channel: item.channel,
          },
        };
      }),
    );
  }
}
