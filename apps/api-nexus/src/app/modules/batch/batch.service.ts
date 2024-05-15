import { Injectable } from '@nestjs/common'

import { Resource } from '.prisma/api-nexus-client'

import { SpreadsheetRow } from '../../lib/google/sheets.service'
import { PrismaService } from '../../lib/prisma.service'

@Injectable()
export class BatchService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUpdateResourcesLocalization(
    refreshToken: string,
    spreadsheetRows: SpreadsheetRow[]
  ): Promise<
    Array<{
      channel: string
      resourceIds: string[]
    }>
  > {
    const resources: Resource[] = []
    for (const row of spreadsheetRows) {
      const resource = await this.prismaService.resource.findFirst({
        where: { id: row.resourceData?.id },
        include: {
          resourceLocalizations: {
            where: { language: row.language, videoId: row.videoId }
          },
          resourceChannels: { where: { youtubeId: row.videoId } }
        }
      })
      if (resource?.resourceLocalizations.length === 0) {
        // Create Localization is it is not existing
        await this.prismaService.resourceLocalization.create({
          data: {
            resourceId: resource?.id,
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
      } else {
        await this.prismaService.resourceLocalization.update({
          where: { id: resource?.resourceLocalizations[0].id },
          data: {
            title: row.title,
            description: row.description,
            keywords: row.keywords,
            captionFile: row.captionFile,
            audioTrackFile: row.audioTrackFile,
            videoId: row.videoId,
            resourceLocalizationSource: {
              upsert: {
                where: {
                  reourceLocalizationId: resource?.resourceLocalizations[0].id
                },
                create: {
                  // AUDIO
                  audioMimeType: row.audioTrackDriveFile?.mimeType,
                  audioTrackGoogleDriveId: row.audioTrackDriveFile?.id,
                  audioTrackGoogleDriveRefreshToken: refreshToken,

                  // CAPTION
                  captionMimeType: row.captionDriveFile?.mimeType,
                  captionGoogleDriveId: row.captionDriveFile?.id,
                  captionGoogleDriveRefreshToken: refreshToken
                },
                update: {
                  // AUDIO
                  audioMimeType: row.audioTrackDriveFile?.mimeType,
                  audioTrackGoogleDriveId: row.audioTrackDriveFile?.id,
                  audioTrackGoogleDriveRefreshToken: refreshToken,

                  // CAPTION
                  captionMimeType: row.captionDriveFile?.mimeType,
                  captionGoogleDriveId: row.captionDriveFile?.id,
                  captionGoogleDriveRefreshToken: refreshToken
                }
              }
            }
            // create resourceLocalizationsource
          },
          include: { resource: true, resourceLocalizationSource: true }
        })
      }
      if (resource != null) {
        resources.push(resource)
      }
    }

    const batches: Array<{
      channel: string
      resourceIds: string[]
    }> = []

    const uniqueChannels = spreadsheetRows
      .map((item) => item.channelData?.id)
      .filter(
        (channelId): channelId is string =>
          channelId !== null && channelId !== undefined
      )
      .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates

    for (const channel of uniqueChannels) {
      const resourceIds = spreadsheetRows
        .filter(
          (item) => item.channelData?.id === channel && item.resourceData?.id
        )
        .map((item) => item.resourceData?.id ?? '')
      batches.push({ channel, resourceIds })
    }
    return batches
  }
}
