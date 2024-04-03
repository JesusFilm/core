import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import {
  Channel,
  Resource,
  ResourceLocalization,
} from '.prisma/api-nexus-client';

import { PrivacyStatus } from '../../__generated__/graphql';
import { PrismaService } from '../../lib/prisma.service';
import { SpreadsheetRow } from '../google-drive/googleDriveService';

@Injectable()
export class BatchService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUploadResourceFromSpreadsheet(
    nexusId: string,
    refreshToken: string,
    data: SpreadsheetRow[],
  ): Promise<Array<{ resource: Resource; channel: Channel }>> {
    const batchResources: Array<{ resource: Resource; channel: Channel }> = [];
    for (const row of data) {
      const resource = await this.prismaService.resource.create({
        data: {
          id: uuidv4(),
          name: row.filename ?? '',
          nexusId,
          status: row.channelData?.id !== null ? 'processing' : 'published',
          sourceType: 'template',
          createdAt: new Date(),
          customThumbnail: row.custom_thumbnail,
          category: row.category,
          privacy: row.privacy as PrivacyStatus,
          notifySubscribers: row.notify_subscribers,
          playlistId: row.playlist_id,
          isMadeForKids: row.is_made_for_kids,
          mediaComponentId: row.media_component_id,
          localizations: {
            create: {
              title: row.title ?? '',
              description: row.description ?? '',
              keywords: row.keywords ?? '',
              language: row.text_language ?? '',
              captionFile: row.caption_file ?? '',
              localizedResourceFile: {
                create: {
                  captionMimeType: row.captionDriveFile?.mimeType ?? '',
                  captionDriveId: row.captionDriveFile?.id ?? '',
                  audioDriveId: row.audioTrackDriveFile?.id ?? '',
                  audioMimeType: row.audioTrackDriveFile?.mimeType ?? '',
                  refreshToken,
                },
              },
            },

            // createMany: {
            //   data: [
            //     {
            //       title: row.title ?? '',
            //       description: row.description ?? '',
            //       keywords: row.keywords ?? '',
            //       language: row.text_language ?? '',
            //     },
            //     {
            //       captionFile: row.caption_file ?? '',
            //       language: row.caption_language ?? '',
            //     },
            //   ],
            // },
          },
          googleDrive: {
            create: {
              mimeType: row.driveFile?.mimeType ?? '',
              driveId: row.driveFile?.id ?? '',
              refreshToken,
            },
          },
          thumbnailGoogleDrive: {
            create: {
              mimeType: row.customThumbnailDriveFile?.mimeType ?? '',
              driveId: row.customThumbnailDriveFile?.id ?? '',
              refreshToken,
            },
          },
        },
      });
      if (row.channelData !== undefined && resource !== null) {
        batchResources.push({ resource, channel: row.channelData });
      }
    }
    return batchResources;
  }

  async createResourcesLocalization(
    refreshToken: string,
    data: SpreadsheetRow[],
  ): Promise<
    Array<{ resourceLocalization: ResourceLocalization; channel: Channel }>
  > {
    const localizationBatch: Array<{
      resourceLocalization: ResourceLocalization;
      channel: Channel;
    }> = [];
    for (const row of data) {
      const resourceYoutubeChannel =
        await this.prismaService.resourceYoutubeChannel.findFirst({
          where: { youtubeId: row.video_id },
          include: { resource: true },
        });
      if (resourceYoutubeChannel != null) {
        const existingLocalization =
          await this.prismaService.resourceLocalization.findFirst({
            where: {
              resourceId: resourceYoutubeChannel.resourceId,
              language: row.language,
            },
          });
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
                  row.caption_file ?? existingLocalization.captionFile,
                audioTrackFile:
                  row.audio_track_file ?? existingLocalization.audioTrackFile,
                videoId: row.video_id ?? existingLocalization.videoId,
              },
              include: { resource: true, localizedResourceFile: true },
            });
          if (row.channelData !== undefined) {
            localizationBatch.push({
              resourceLocalization: localization,
              channel: row.channelData,
            });
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
                captionFile: row.caption_file ?? '',
                audioTrackFile: row.audio_track_file ?? '',
                videoId: row.video_id ?? '',
                localizedResourceFile: {
                  create: {
                    captionMimeType: row.captionDriveFile?.mimeType ?? '',
                    captionDriveId: row.captionDriveFile?.id ?? '',
                    audioDriveId: row.audioTrackDriveFile?.id ?? '',
                    audioMimeType: row.audioTrackDriveFile?.mimeType ?? '',
                    refreshToken,
                  },
                },
              },
              include: { resource: true, localizedResourceFile: true },
            });
          if (row.channelData !== undefined) {
            localizationBatch.push({
              resourceLocalization: localization,
              channel: row.channelData,
            });
          }
        }
      }
    }
    return localizationBatch;
  }

  prepareBatchResourcesForUploadBatchJob(
    batchResources: Array<{ resource: Resource; channel: Channel }>,
  ): Array<{ channel: Channel; resources: Resource[] }> {
    const batches: Array<{ channel: Channel; resources: Resource[] }> = [];
    const uniqueChannels = batchResources
      .filter((item, index, self) => {
        return (
          index === self.findIndex((t) => t.channel?.id === item.channel?.id) &&
          item.channel !== undefined
        );
      })
      .map((item) => item.channel);

    for (const channel of uniqueChannels) {
      if (channel === undefined) continue;
      const resources = batchResources
        .filter((item) => {
          return item.channel?.id === channel.id;
        })
        .map((item) => item.resource);
      batches.push({ channel, resources });
    }
    return batches;
  }

  prepareBatchResourceLocalizationsForBatchJob(
    batchResourceLocalizations: Array<{
      resourceLocalization: ResourceLocalization;
      channel: Channel;
    }>,
  ): Array<{
    videoId: string;
    channel: Channel;
    localizations: ResourceLocalization[];
  }> {
    const batches: Array<{
      videoId: string;
      channel: Channel;
      localizations: ResourceLocalization[];
    }> = [];

    // Extract unique videoIds, ignoring null values
    const uniqueVideoIds = batchResourceLocalizations
      .map((item) => item.resourceLocalization.videoId)
      .filter((videoId): videoId is string => videoId !== null) // Filter out null values and ensure videoId is treated as string
      .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates

    for (const videoId of uniqueVideoIds) {
      const localizationsAndChannels = batchResourceLocalizations.filter(
        (item) => item.resourceLocalization.videoId === videoId,
      );

      const localizations = localizationsAndChannels.map(
        (item) => item.resourceLocalization,
      );
      const channel = localizationsAndChannels[0]?.channel; // Choose the first channel as the representative

      if (channel !== null) {
        // Ensure channel is not undefined
        batches.push({ videoId, localizations, channel });
      }
    }

    return batches;
  }
}
