import { Injectable } from '@nestjs/common'

import { Channel, ResourceLocalization } from '.prisma/api-nexus-client'

import { SpreadsheetRow } from '../../lib/google/sheets.service'
import { PrismaService } from '../../lib/prisma.service'

@Injectable()
export class BatchService {
  constructor(private readonly prismaService: PrismaService) {}

  async createResourcesLocalization(
    refreshToken: string,
    data: SpreadsheetRow[]
  ): Promise<
    Array<{ resourceLocalization: ResourceLocalization; channel: Channel }>
  > {
    const localizationBatch: Array<{
      resourceLocalization: ResourceLocalization
      channel: Channel
    }> = []
    for (const row of data) {
      const resourceYoutubeChannel =
        await this.prismaService.resourceChannel.findFirst({
          where: { youtubeId: row.videoId },
          include: { resource: true }
        })
      if (resourceYoutubeChannel != null) {
        const existingLocalization =
          await this.prismaService.resourceLocalization.findFirst({
            where: {
              resourceId: resourceYoutubeChannel.resourceId,
              language: row.language
            }
          })
        if (existingLocalization != null) {
          const localization =
            await this.prismaService.resourceLocalization.update({
              where: { id: existingLocalization.id },
              data: {
                title: row.title ?? existingLocalization.title,
                description:
                  row.description ?? existingLocalization.description,
                keywords: row.keywords ?? existingLocalization.keywords,
                captionFile:
                  row.captionFile ?? existingLocalization.captionFile,
                audioTrackFile:
                  row.audioTrackFile ?? existingLocalization.audioTrackFile,
                videoId: row.videoId ?? existingLocalization.videoId
              },
              include: { resource: true, resourceLocalizationSource: true }
            })
          if (row.channelData !== undefined) {
            localizationBatch.push({
              resourceLocalization: localization,
              channel: row.channelData
            })
          }
        } else {
          const localization =
            await this.prismaService.resourceLocalization.create({
              data: {
                resourceId: resourceYoutubeChannel.resourceId,
                title: row.title ?? '',
                description: row.description ?? '',
                keywords: row.keywords ?? '',
                language: row.language ?? '',
                captionFile: row.captionFile ?? '',
                audioTrackFile: row.audioTrackFile ?? '',
                videoId: row.videoId ?? '',
                resourceLocalizationSource: {
                  create: {
                    captionMimeType: row.captionDriveFile?.mimeType ?? '',
                    captionGoogleDriveId: row.captionDriveFile?.id ?? '',
                    captionGoogleDriveRefreshToken: refreshToken,
                    audioTrackGoogleDriveId: row.audioTrackDriveFile?.id ?? '',
                    audioMimeType: row.audioTrackDriveFile?.mimeType ?? '',
                    audioTrackGoogleDriveRefreshToken: refreshToken
                  }
                }
              },
              include: { resource: true, resourceLocalizationSource: true }
            })
          if (row.channelData !== undefined) {
            localizationBatch.push({
              resourceLocalization: localization,
              channel: row.channelData
            })
          }
        }
      }
    }
    return localizationBatch
  }

  prepareBatchResourceLocalizationsForBatchJob(
    batchResourceLocalizations: Array<{
      resourceLocalization: ResourceLocalization
      channel: Channel
    }>
  ): Array<{
    videoId: string
    channel: Channel
    localizations: ResourceLocalization[]
  }> {
    const batches: Array<{
      videoId: string
      channel: Channel
      localizations: ResourceLocalization[]
    }> = []

    // Extract unique videoIds, ignoring null values
    const uniqueVideoIds = batchResourceLocalizations
      .map((item) => item.resourceLocalization.videoId)
      .filter((videoId): videoId is string => videoId !== null) // Filter out null values and ensure videoId is treated as string
      .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates

    for (const videoId of uniqueVideoIds) {
      const localizationsAndChannels = batchResourceLocalizations.filter(
        (item) => item.resourceLocalization.videoId === videoId
      )

      const localizations = localizationsAndChannels.map(
        (item) => item.resourceLocalization
      )
      const channel = localizationsAndChannels[0]?.channel // Choose the first channel as the representative

      if (channel !== null) {
        // Ensure channel is not undefined
        batches.push({ videoId, localizations, channel })
      }
    }

    return batches
  }
}
