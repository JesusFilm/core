import { InjectQueue } from '@nestjs/bull'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { Job, Queue } from 'bull'

import { PrismaService } from '../../prisma.service'
import {
  UpdateVideoLocalizationJob,
  UploadResourceJob
} from '../bullMQ.service'

@Injectable()
export class NexusJobListener implements OnModuleInit {
  constructor(
    @InjectQueue('nexus-batch-worker') private readonly uploadQueue: Queue,
    private readonly prismaService: PrismaService
  ) {}

  onModuleInit(): void {
    this.listenToProgressEvents()
    this.listenToCompletedEvents()
    this.listenToFailedEvents()
  }

  private listenToProgressEvents(): void {
    this.uploadQueue.on(
      'progress',
      (
        job: Job<UploadResourceJob | UpdateVideoLocalizationJob>,
        progress: number
      ) => {
        void Promise.all([
          this.prismaService.batchTask.updateMany({
            where: { id: job.data.batchTaskId },
            data: { progress, status: 'processing' }
          })
        ])
      }
    )
  }

  private listenToCompletedEvents(): void {
    this.uploadQueue.on(
      'completed',
      (job: Job<UploadResourceJob | UpdateVideoLocalizationJob>) => {
        void Promise.all([
          this.prismaService.batchTask.updateMany({
            where: { id: job.data.batchTaskId },
            data: { progress: 100, status: 'completed' }
          })
        ])
        void Promise.all([
          this.prismaService.batch.updateMany({
            where: {
              id: job.data.batchId,
              batchTasks: { every: { progress: 100 } }
            },
            data: { status: 'completed' }
          })
        ])

        if (job.name === 'processResourceUpload') {
          const jobData = job.data as UploadResourceJob
          void Promise.all([
            this.prismaService.resource.updateMany({
              where: { id: jobData.resource.id },
              data: {
                status: 'done'
              }
            })
          ])
        }
      }
    )
  }

  private listenToFailedEvents(): void {
    this.uploadQueue.on(
      'failed',
      (job: Job<UploadResourceJob | UpdateVideoLocalizationJob>) => {
        void Promise.all([
          this.prismaService.batchTask.updateMany({
            where: { id: job.data.batchTaskId },
            data: { progress: 0, status: 'failed', error: job.failedReason }
          }),
          this.prismaService.batch.updateMany({
            where: { id: job.data.batchId },
            data: { status: 'error' }
          })
        ])

        if (job.name === 'processResourceUpload') {
          const jobData = job.data as UploadResourceJob
          void Promise.all([
            this.prismaService.resource.updateMany({
              where: { id: jobData.resource.id },
              data: {
                status: 'error'
              }
            })
          ])
        }
      }
    )
  }
}
