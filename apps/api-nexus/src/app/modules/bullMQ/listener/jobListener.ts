// import {
//   OnQueueEvent,
//   QueueEventsHost,
//   QueueEventsListener,
// } from '@nestjs/bullmq';

// @QueueEventsListener('nexus-bucket')
// export class NexusJobListener extends QueueEventsHost {
//   @OnQueueEvent('completed')
//   // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
//   onCompleted({
//     jobId,
//   }: {
//     jobId: string;
//     returnvalue: string;
//     prev?: string;
//   }) {
//     console.log('jobId completed', jobId)
//   }

//   @OnQueueEvent('progress')
//   // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
//   onProgress({ jobId, data }: { jobId: string; data: number | object }) {
//     console.log('jobId progress', jobId)
//     console.log('data progress', data)
//     return null;
//   }
// }

import { InjectQueue } from '@nestjs/bull';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Job, Queue } from 'bull';

import { PrismaService } from '../../../lib/prisma.service';

@Injectable()
export class NexusJobListener implements OnModuleInit {
  constructor(
    @InjectQueue('nexus-bucket') private readonly audioQueue: Queue,
    private readonly prismaService: PrismaService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  onModuleInit() {
    this.listenToProgressEvents();
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private listenToProgressEvents() {
    this.audioQueue.on('progress', async (job: Job, progress: number) => {
      // console.log('jobId progress', job);
      console.log('data progress', progress);

      Promise.all([
        await this.prismaService.batchResource.updateMany({
          data: {
            percent: progress,
          },
          where: {
            batchId: job.data.batchId,
            resourceId: job.data.resource.id,
          },
        }),
      ]);
    });
    this.audioQueue.on('completed', async (job: Job) => {
      Promise.all([
        await this.prismaService.batchResource.updateMany({
          data: {
            isCompleted: true,
            percent: 100,
          },
          where: {
            batchId: job.data.batchId,
            resourceId: job.data.resource.id,
          },
        }),
      ]);
    });

    this.audioQueue.on('failed', async (job: Job) => {
      Promise.all([
        await this.prismaService.batchResource.updateMany({
          data: {
            isCompleted: false,
            error: 'Job failed',
          },
          where: {
            batchId: job.data.batchId,
            resourceId: job.data.resource.id,
          },
        }),
      ]);
    });
  }
}
