import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import Bull, { Queue } from 'bull'

import { Batch, Channel, Resource } from '.prisma/api-nexus-client'

import { PrivacyStatus } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

export interface UploadResourceJob {
  batchId: string
  batchTaskId: string
  accessToken: string
  resource: {
    id: string
    driveId: string
    title: string
    description: string
    language?: string
    thumbnailDriveId?: string
    thumbnailMimeType?: string
    captionDriveId?: string
    privacyStatus?: string
  }
  channel: {
    id: string
    channelId: string
  }
}
export interface UpdateVideoLocalizationJob {
  batchId: string
  batchTaskId: string
  accessToken: string
  channel: {
    id: string
    channelId: string
  }
  resource: {
    language: string
    title: string
    description: string
    category: string
    privacyStatus?: string
    isMadeForKids: boolean
    thumbnailDriveId?: string
    thumbnailMimeType?: string
  }
  localizations: Array<{
    videoId: string
    resourceId?: string
    title?: string
    description?: string
    language: string
    captionDriveId?: string
  }>
}

export interface UpdateVideoCaption {
  batchId: string
  batchTaskId: string
  resource: {
    id: string
    driveId: string
    mimeType: string
    refreshToken: string
    videoId: string
    language: string
  }
  channel: {
    id: string
    channelId: string
    refreshToken: string
  }
}

@Injectable()
export class BullMQService {
  constructor(
    private readonly prismaService: PrismaService,
    @InjectQueue('nexus-batch-worker') private readonly batchJobQueue: Queue
  ) {}

  private async createUploadResourceBatchJob(
    accessToken: string,
    batchId: string,
    channel: Channel
  ): Promise<Array<Bull.Job<unknown>>> {
    const batch = await this.prismaService.batch.findUnique({
      where: {
        id: batchId
      },
      include: {
        batchTasks: true
      }
    })

    if (batch == null) {
      throw new Error('Batch not found @ worker')
    }

    const channelData = await this.prismaService.channel.findUnique({
      where: { id: channel.id }
    })

    const jobs = await Promise.all(
      batch.batchTasks.map(async (batchTask) => {
        const task = batchTask.task as { channelId: string; resourceId: string }
        const resource = await this.prismaService.resource.findUnique({
          where: { id: task.resourceId ?? '' },
          include: {
            resourceLocalizations: true
          }
        })

        if (resource == null) {
          throw new Error('Resource not found')
        }

        const jobData: UploadResourceJob = {
          batchId: batch.id,
          batchTaskId: batchTask.id,
          accessToken,
          resource: {
            id: resource.id,
            driveId: resource?.videoGoogleDriveId ?? '',
            title: resource.resourceLocalizations[0]?.title ?? '',
            description: resource.resourceLocalizations[0]?.description ?? '',
            thumbnailDriveId: resource?.thumbnailGoogleDriveId ?? '',
            thumbnailMimeType: resource?.thumbnailMimeType ?? '',
            privacyStatus: resource.privacy ?? PrivacyStatus.private
          },
          channel: {
            id: channel?.id ?? '',
            channelId: channelData?.youtubeId ?? ''
          }
        }

        return {
          name: batchTask.type,
          data: jobData
        }
      })
    )
    return await this.batchJobQueue.addBulk(
      jobs.filter((job) => job.data !== undefined)
    )
  }

  async createUploadResourceBatch(
    token: string,
    batchName: string,
    channel: Channel,
    resources: Resource[]
  ): Promise<Batch> {
    const batch = await this.prismaService.batch.create({
      data: {
        name: batchName
      }
    })
    await this.prismaService.batchTask.createMany({
      data: resources.map((resource) => {
        return {
          batchId: batch.id,
          type: 'processResourceUpload',
          task: {
            resourceId: resource.id,
            channelId: channel.id
          }
        }
      })
    })

    await this.createUploadResourceBatchJob(token, batch.id, channel)

    return batch as unknown as Batch
  }

  async createLocalizationBatch(
    accessToken: string,
    batchName: string,
    channelId: string,
    resourceIds: string[]
  ): Promise<Batch> {
    // Create Batch
    const batch = await this.prismaService.batch.create({
      data: {
        name: batchName
      }
    })
    const channel = await this.prismaService.channel.findFirst({
      where: { id: channelId },
      include: {
        resourceChannels: { where: { resourceId: { in: resourceIds } } }
      }
    })

    const resources = await this.prismaService.resource.findMany({
      where: { id: { in: resourceIds } },
      include: {
        resourceLocalizations: true
      }
    })
    // Create Batch Tasks
    await this.prismaService.batchTask.createMany({
      data: resources.map((resource) => {
        return {
          batchId: batch.id,
          type: 'UPDATE_LOCALIZATION',
          status: 'pending',
          task: {
            resourceId: resource.id,
            localization: resource.resourceLocalizations.map((item) => item.id),
            channel
          }
        }
      })
    })

    for (const item of resources) {
      const batchTask = await this.prismaService.batchTask.findFirst({
        where: { task: { path: ['resourceId'], equals: item.id } }
      })
      const job: UpdateVideoLocalizationJob = {
        batchId: batch.id,
        batchTaskId: batchTask?.id ?? '',
        accessToken,
        channel: {
          id: channel?.id ?? '',
          channelId: channel?.resourceChannels[0].channelId ?? ''
        },
        resource: {
          language: item.language ?? 'en',
          title:
            item.resourceLocalizations.find(
              (localization) => localization.language === item.language
            )?.title ?? '',
          description:
            item.resourceLocalizations.find(
              (localization) => localization.language === item.language
            )?.description ?? '',
          category: item.category ?? '',
          privacyStatus: item.privacy,
          isMadeForKids: item.isMadeForKids,
          thumbnailDriveId: item?.thumbnailGoogleDriveId ?? undefined,
          thumbnailMimeType: item?.thumbnailMimeType ?? undefined
        },
        localizations: item.resourceLocalizations.map((loc) => {
          return {
            videoId: loc.videoId ?? '',
            language: loc.language ?? '',
            title: loc.title ?? '',
            description: loc.description ?? '',
            resourceId: loc.resourceId ?? '',
            captionDriveId: loc?.captionGoogleDriveId ?? ''
          }
        })
      }
      await this.batchJobQueue.addBulk([
        { data: job, name: 'processResourceUpdate' }
      ])
    }
    return batch
  }
}
