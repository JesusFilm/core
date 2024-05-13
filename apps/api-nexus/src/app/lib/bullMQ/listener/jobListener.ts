/* eslint-disable @typescript-eslint/no-misused-promises */
import { InjectQueue } from '@nestjs/bull'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { Job, Queue } from 'bull'

// import { PrismaService } from '../../prisma.service'
import { UploadResourceJob } from '../bullMQ.service'

@Injectable()
export class NexusJobListener implements OnModuleInit {
  constructor(
    @InjectQueue('nexus-batch-worker') private readonly uploadQueue: Queue // private readonly prismaService: PrismaService
  ) {}

  onModuleInit(): void {
    this.listenToProgressEvents()
    this.listenToCompletedEvents()
    this.listenToFailedEvents()
  }

  private listenToProgressEvents(): void {
    this.uploadQueue.on(
      'progress',
      async (job: Job<UploadResourceJob>, progress: number) => {
        // console.log('Job Progress:', job.id, progress);
        // void Promise.all([
        //   await this.prismaService.batchResource.updateMany({
        //     data: {
        //       percent: progress
        //     },
        //     where: {
        //       batchId: job.data.batchId,
        //       resourceId: job.data.resource.id
        //     }
        //   })
        // ])
      }
    )
  }

  private listenToCompletedEvents(): void {
    this.uploadQueue.on('completed', async (job: Job<UploadResourceJob>) => {
      console.log('Job completed: ', job.id)
      void Promise.all([
        // await this.prismaService.batchResource.updateMany({
        //   data: {
        //     isCompleted: true,
        //     percent: 100
        //   },
        //   where: {
        //     batchId: job.data.batchId,
        //     resourceId: job.data.resource.id
        //   }
        // }),
        // await this.prismaService.resource.update({
        //   data: { status: 'published' },
        //   where: { id: job.data.resource.id }
        // })
      ])
    })
  }

  private listenToFailedEvents(): void {
    this.uploadQueue.on('failed', async (job: Job<UploadResourceJob>) => {
      console.log('Job failed', job.stacktrace)
      // void Promise.all([
      //   await this.prismaService.batchResource.updateMany({
      //     data: {
      //       isCompleted: false,
      //       error: 'Job failed'
      //     },
      //     where: {
      //       batchId: job.data.batchId,
      //       resourceId: job.data.resource.id
      //     }
      //   }),
      //   await this.prismaService.resource.update({
      //     data: { status: 'error' },
      //     where: { id: job.data.resource.id }
      //   })
      // ])
    })
  }
}
