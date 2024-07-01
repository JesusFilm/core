import { Injectable } from "@nestjs/common";

import { Resource } from ".prisma/api-nexus-client";

import { PrivacyStatus } from "../../__generated__/graphql";
import { SpreadsheetRow } from "../../lib/google/sheets.service";
import { PrismaService } from "../../lib/prisma.service";

@Injectable()
export class BatchService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUpdateResourcesLocalization(
    token: string,
    spreadsheetRows: SpreadsheetRow[]
  ): Promise<
    Array<{
      channel: string;
      resourceIds: string[];
    }>
  > {
    const resources: Resource[] = [];
    for (const row of spreadsheetRows) {
      const resource = await this.prismaService.resource.findFirst({
        where: { id: row.resourceData?.id },
        include: {
          resourceLocalizations: {
            where: { language: row.language, videoId: row.videoId },
          },
          resourceChannels: { where: { channel: { youtubeId: row.videoId } } },
        },
      });
      if (resource != null) {
        // Update Resource
        await this.prismaService.resource.update({
          where: { id: row.resourceData?.id },
          data: {
            customThumbnail: row.customThumbnail,
            isMadeForKids:
              row.isMadeForKids !== undefined
                ? ["1", "true", "on", "yes", "y"].includes(row.isMadeForKids)
                : undefined,
            privacy: row.privacy as PrivacyStatus,
            category: row.category,
            notifySubscribers:
              row.notifySubscribers !== undefined
                ? ["1", "true", "on", "yes", "y"].includes(
                    row.notifySubscribers.toLocaleLowerCase()
                  )
                : undefined,
            thumbnailGoogleDriveId: row.customThumbnailDriveFile?.id,
            thumbnailMimeType: row.customThumbnailDriveFile?.mimeType,
          },
        });
      }
      if (resource?.resourceLocalizations?.length === 0) {
        // Create Localization is it is not existing
        await this.prismaService.resourceLocalization.create({
          data: {
            resourceId: resource?.id,
            title: row.title ?? "",
            description: row.description ?? "",
            keywords: row.keywords ?? "",
            language: row.language ?? "en",
            captionFile: row.captionFile ?? "",
            audioTrackFile: row.audioTrackFile ?? "",
            videoId: row.videoId ?? "",
            captionGoogleDriveId: row.captionDriveFile?.id ?? "",
            captionMimeType: row.captionDriveFile?.mimeType ?? "",
            audioTrackGoogleDriveId: row.audioTrackDriveFile?.id ?? "",
            audioTrackMimeType: row.audioTrackDriveFile?.mimeType ?? "",
          },
          include: { resource: true },
        });
      } else {
        await this.prismaService.resourceLocalization.update({
          where: { id: resource?.resourceLocalizations[0].id },
          data: {
            title: row.title,
            description: row.description,
            keywords: row.keywords,
            captionFile: row.captionFile,
            audioTrackFile: row.audioTrackFile,
            language: row.language ?? "en",
            videoId: row.videoId,
            captionGoogleDriveId: row.captionDriveFile?.id,
            captionMimeType: row.captionDriveFile?.mimeType,
            audioTrackGoogleDriveId: row.audioTrackDriveFile?.id,
            audioTrackMimeType: row.audioTrackDriveFile?.mimeType,
          },
          include: { resource: true },
        });
      }
      if (resource != null) {
        resources.push(resource);
      }
    }

    const batches: Array<{
      channel: string;
      resourceIds: string[];
    }> = [];

    const uniqueChannels = spreadsheetRows
      .map((item) => item.channelData?.id)
      .filter(
        (channelId): channelId is string =>
          channelId !== null && channelId !== undefined
      )
      .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates

    for (const channel of uniqueChannels) {
      const resourceIds = spreadsheetRows
        .filter(
          (item) => item.channelData?.id === channel && item.resourceData?.id
        )
        .map((item) => item.resourceData?.id ?? "");
      batches.push({ channel, resourceIds });
    }
    return batches;
  }
}
