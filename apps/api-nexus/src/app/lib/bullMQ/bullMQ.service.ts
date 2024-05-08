import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import Bull, { Queue } from 'bull'

import {
  Batch,
  Channel,
  Resource,
  ResourceLocalization
} from '.prisma/api-nexus-client'

import { PrivacyStatus } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

export interface UploadResourceJob {
  batchId: string
  batchTaskId: string
  resource: {
    id: string
    driveId: string
    refreshToken: string
    title: string
    description: string
    language?: string
    thumbnailDriveId?: string
    captionDriveId?: string
    privacyStatus?: string
  }
  channel: {
    id: string
    channelId: string
    refreshToken: string
  }
}
export interface UpdateVideoLocalization {
  batchId: string
  batchTaskId: string
  videoId: string
  channel: {
    id: string
    channelId: string
    refreshToken: string
  }
  resource: {
    refreshToken: string
    thumbnailDriveId?: string
    privacyStatus?: string
  }
  localizations: Array<{
    resourceId?: string
    title?: string
    description?: string
    tags?: string[]
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
      throw new Error('Batch not found')
    }

    const channelData = await this.prismaService.channel.findUnique({
      where: { id: channel.id },
      include: { youtube: true }
    })

    const jobs = await Promise.all(
      batch.batchTasks.map(async (batchTask) => {
        const task = JSON.parse(batchTask?.task?.toString() ?? '')
        const resource = await this.prismaService.resource.findUnique({
          where: { id: task.resourceId ?? '' },
          include: {
            resourceSource: true,
            resourceLocalizations: true
          }
        })

        if (resource == null) {
          throw new Error('Resource not found')
        }

        const jobData: UploadResourceJob = {
          batchId: batch.id,
          batchTaskId: task.id,
          resource: {
            id: resource.id,
            driveId: resource.resourceSource?.videoGoogleDriveId ?? '',
            refreshToken:
              resource.resourceSource?.videoGoogleDriveRefreshToken ?? '',
            title: resource.resourceLocalizations[0]?.title ?? '',
            description: resource.resourceLocalizations[0]?.description ?? '',
            thumbnailDriveId:
              resource.resourceSource?.thumbnailGoogleDriveId ?? '',
            privacyStatus: resource.privacy ?? PrivacyStatus.private
          },
          channel: {
            id: channel?.id ?? '',
            channelId: channelData?.youtube?.youtubeId ?? '',
            refreshToken: channelData?.youtube?.refreshToken ?? ''
          }
        }

        return {
          name: task.type,
          data: jobData
        }
      })
    )

    console.log('jobs', jobs)
    return await this.batchJobQueue.addBulk(
      jobs.filter((job) => job.data !== undefined)
    )
  }

  private async createLocalizationBatchJob(
    batchId: string,
    videoId: string,
    localizations: ResourceLocalization[],
    channel: Channel
  ): Promise<Array<Bull.Job<unknown>>> {
    const batch = await this.prismaService.batch.findUnique({
      where: {
        id: batchId
      },
      include: {
        batchTasks: {
          where: {
            type: 'localization'
          }
        }
      }
    })

    if (batch == null) {
      throw new Error('Batch not found')
    }
    const channelData = await this.prismaService.channel.findUnique({
      where: { id: channel.id },
      include: { youtube: true }
    })

    const jobs = []

    for (const task of batch.batchTasks) {
      const resource = await this.prismaService.resource.findUnique({
        where: { id: JSON.parse(task.task as string).resourceId },
        include: {
          resourceSource: true,
          resourceLocalizations: {
            include: {
              resourceLocalizationSource: true
            }
          }
        }
      })

      if (resource == null) {
        throw new Error('Resource not found')
      }

      const jobData = {
        batchId,
        batchTaskId: task.id,
        videoId,
        channel: {
          id: channel.id,
          channelId: channelData?.youtube?.youtubeId ?? '',
          refreshToken: channelData?.youtube?.refreshToken ?? ''
        },
        resource: {
          refreshToken:
            resource.resourceSource?.videoGoogleDriveRefreshToken ?? '',
          thumbnailDriveId:
            resource.resourceSource?.thumbnailGoogleDriveId ?? '',
          privacyStatus: resource.privacy ?? undefined
        },
        localizations: localizations.map((loc) => ({
          resourceId: loc.resourceId,
          title: loc.title ?? '',
          description: loc.description ?? '',
          language: loc.language
        }))
      }
      console.log('jobData', jobData)
      // jobs.push({
      //   name: 'processLocalization',
      //   data: jobData,
      // });
    }
    return await this.batchJobQueue.addBulk(jobs)
  }

  async createCaptionBatchJob(
    batchId: string,
    channel: Channel
  ): Promise<Array<Bull.Job<unknown>>> {
    const batch = await this.prismaService.batch.findUnique({
      where: {
        id: batchId
      },
      include: {
        batchTasks: {
          where: {
            type: 'caption_processing'
          }
        }
      }
    })

    if (batch == null) {
      throw new Error('Batch not found')
    }

    const channelData = await this.prismaService.channel.findUnique({
      where: { id: channel.id },
      include: { youtube: true }
    })

    const jobs: Array<{ name: string; data: unknown }> = []

    for (const task of batch.batchTasks) {
      const resource = await this.prismaService.resource.findUnique({
        where: { id: JSON.parse(task.task as string).resourceId },
        include: {
          resourceLocalizations: {
            include: {
              resourceLocalizationSource: true
            }
          }
        }
      })

      if (resource == null) {
        throw new Error('Resource not found')
      }

      for (const localization of resource.resourceLocalizations) {
        jobs.push({
          name: 'processCaption',
          data: {
            batchId,
            batchTaskId: task.id,
            videoId: localization.videoId,
            channel: {
              id: channel.id,
              channelId: channelData?.youtube?.youtubeId,
              refreshToken: channelData?.youtube?.refreshToken
            },
            resource: {
              driveId:
                localization.resourceLocalizationSource?.captionGoogleDriveId,
              mimeType:
                localization.resourceLocalizationSource?.captionMimeType,
              language: localization.language,
              refreshToken:
                localization.resourceLocalizationSource
                  ?.captionGoogleDriveRefreshToken,
              videoId: localization.videoId
            }
          }
        })
      }
    }

    return await this.batchJobQueue.addBulk(jobs)
  }

  async createUploadResourceBatch(
    batchName: string,
    nexusId: string,
    channel: Channel,
    resources: Resource[]
  ): Promise<Batch> {
    console.log('Creating upload batch...')
    const batch = await this.prismaService.batch.create({
      data: {
        name: batchName,
        nexusId
      }
    })
    await this.prismaService.batchTask.createMany({
      data: resources.map((resource) => {
        return {
          batchId: batch.id,
          type: 'RESOURCE_UPLOAD',
          task: {
            resourceId: resource.id,
            channelId: channel.id
          }
        }
      })
    })

    await this.createUploadResourceBatchJob(batch.id, channel)

    return batch as unknown as Batch
  }

  async createLocalizationBatch(
    batchName: string,
    nexusId: string,
    videoId: string,
    channel: Channel,
    localizations: ResourceLocalization[]
  ): Promise<Batch> {
    console.log('createLocalizationBatch')
    const batch = await this.prismaService.batch.create({
      data: {
        name: batchName,
        nexusId
      }
    })

    // task for localization
    await this.prismaService.batchTask.createMany({
      data: localizations.map((localization) => {
        return {
          batchId: batch.id,
          resourceId: localization.resourceId,
          type: 'localization',
          status: 'pending',
          metadata: {
            localization,
            channel
          }
        }
      })
    })

    // task for caption
    await this.prismaService.batchTask.createMany({
      data: localizations.map((localization) => {
        return {
          batchId: batch.id,
          resourceId: localization.resourceId,
          type: 'caption_processing',
          status: 'pending',
          metadata: {
            localization,
            channel
          }
        }
      })
    })

    await this.createLocalizationBatchJob(
      batch.id,
      videoId,
      localizations,
      channel
    )
    await this.createCaptionBatchJob(batch.id, channel)

    return batch as unknown as Batch
  }
}
