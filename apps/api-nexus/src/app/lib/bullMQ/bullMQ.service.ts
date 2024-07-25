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
    fileUrl: string
    title: string | null
    description: string | null
    language: string
    thumbnailFileUrl?: string
    thumbnailMimeType?: string
    captionFileUrl?: string
    captionMimeType?: string
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
    thumbnailFileUrl?: string
    thumbnailMimeType?: string
  }
  localizations: Array<{
    videoId?: string
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
    batchId: string
  ): Promise<Array<Bull.Job<UploadResourceJob>>> {
    const batch = await this.prismaService.batch.findUnique({
      where: {
        id: batchId,
        batchTasks: { every: { resource: { id: { not: undefined } } } }
      },
      include: {
        batchTasks: {
          include: {
            channel: true,
            resource: { include: { resourceLocalizations: true } }
          }
        }
      }
    })

    if (batch == null) {
      throw new Error('Batch not found @ worker')
    }

    const jobs = await Promise.all(
      batch.batchTasks.map(async (batchTask) => {
        const jobData: UploadResourceJob = {
          batchId: batch.id,
          batchTaskId: batchTask.id,
          accessToken,
          resource: {
            id: batchTask.resource?.id ?? '',
            fileUrl: batchTask.resource?.name ?? '',
            title: batchTask.resource?.resourceLocalizations[0]?.title ?? '',
            description:
              batchTask.resource?.resourceLocalizations[0]?.description ?? '',
            language: batchTask.resource?.language ?? 'en',
            thumbnailFileUrl: batchTask.resource?.customThumbnail ?? '',
            captionFileUrl:
              batchTask.resource?.resourceLocalizations[0]?.captionFile ?? '',
            privacyStatus: batchTask.resource?.privacy ?? PrivacyStatus.private
          },
          channel: {
            id: batchTask.channel?.id ?? '',
            channelId: batchTask.channel?.youtubeId ?? ''
          }
        }

        return {
          name: batchTask.type,
          data: jobData
        }
      })
    )
    return await this.batchJobQueue.addBulk(jobs.filter((job) => job))
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

    await this.createUploadResourceBatchJob(token, batch.id)

    return batch
  }

  async createLocalizationBatch(
    accessToken: string,
    batchName: string,
    channelId: string,
    resourceIds: string[]
  ): Promise<Batch> {
    const batch = await this.prismaService.batch.create({
      data: {
        name: batchName
      }
    })
    const channel = await this.prismaService.channel.findUnique({
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

    const batchTasks = await this.prismaService.batchTask.findMany({
      where: { batchId: batch.id },
      include: {
        batch: true,
        channel: true,
        resource: { include: { resourceLocalizations: true } }
      }
    })

    const jobs = await Promise.all(
      batchTasks.map(async (batchTask) => {
        const jobData: UpdateVideoLocalizationJob = {
          batchId: batchTask.batchId,
          batchTaskId: batchTask?.id ?? '',
          accessToken,
          channel: {
            id: batchTask.channelId ?? '',
            channelId: channel?.resourceChannels[0].channelId ?? ''
          },
          resource: {
            language: batchTask.resource?.language ?? 'en',
            title:
              batchTask.resource?.resourceLocalizations.find(
                (localization) =>
                  localization.language === batchTask.resource?.language
              )?.title ?? '',
            description:
              batchTask.resource?.resourceLocalizations.find(
                (localization) =>
                  localization.language === batchTask.resource?.language
              )?.description ?? '',
            category: batchTask.resource?.category ?? '',
            privacyStatus: batchTask.resource?.privacy,
            isMadeForKids: batchTask.resource?.isMadeForKids ?? false,
            thumbnailFileUrl: batchTask.resource?.customThumbnail ?? undefined
          },
          localizations:
            batchTask.resource?.resourceLocalizations.map((loc) => {
              return {
                videoId: loc.videoId ?? '',
                language: loc.language ?? '',
                title: loc.title ?? '',
                description: loc.description ?? '',
                resourceId: loc.resourceId ?? '',
                captionFile: loc?.captionFile ?? ''
              }
            }) ?? []
        }
        return {
          name: 'UPDATE_LOCALIZATION',
          data: jobData
        }
      })
    )
    await this.batchJobQueue.addBulk(jobs)
    return batch
  }
}
