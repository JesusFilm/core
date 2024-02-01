import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import Bull, { Queue } from 'bull';

import { Batch, Channel } from '../../__generated__/graphql';
import { PrismaService } from '../../lib/prisma.service';

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
    private readonly prismaService: PrismaService,
    @InjectQueue('nexus-bucket') private readonly bucketQueue: Queue,
  ) {}

  async createBatchJob(batchJobId: string): Promise<Array<Bull.Job<unknown>>> {
    const batch = await this.prismaService.batch.findUnique({
      where: {
        id: batchJobId,
      },
      include: {
        resources: { include: { googleDrive: true } },
        channel: { include: { youtube: true } },
      },
    });

    const jobs = batch?.resources.map((item) => {
      return {
        name: 'process',
        data: {
          batchId: batch.id,
          resource: {
            driveId: item.googleDrive?.driveId ?? '',
            refreshToken: item.googleDrive?.refreshToken ?? '',
          },
          channel: {
            channelId: batch.channel?.youtube?.youtubeId ?? '',
            refreshToken: batch.channel?.youtube?.refreshToken ?? '',
          },
        },
      };
    });
    return await this.bucketQueue.addBulk(jobs ?? []);
  }

  async createBatch(
    batchName: string,
    nexusId: string,
    channel: Channel,
    resources: Array<{ id: string }>,
  ): Promise<Batch> {
    const batch = await this.prismaService.batch.create({
      data: {
        name: batchName,
        nexusId,
        channelId: channel.id,
        resources: {
          connect: resources.map((resource) => ({
            id: resource.id,
          })),
        },
      },
    });
    await this.createBatchJob(batch.id);

    return batch as Batch;
  }
}
