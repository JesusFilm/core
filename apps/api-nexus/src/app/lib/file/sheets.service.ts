import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";

import { Channel, Resource } from ".prisma/api-nexus-client";

import { PrivacyStatus } from "../../__generated__/graphql";
import { BatchService } from "../../modules/batch/batch.service";
import { BullMQService } from "../bullMQ/bullMQ.service";
import { PrismaService } from "../prisma.service";

export interface SpreadsheetRow {
  channel?: string;
  channelData?: Channel;
  resourceData?: Resource;
  filename?: string;
  title?: string;
  description?: string;
  customThumbnail?: string;
  keywords?: string;
  category?: string;
  privacy?: string;
  spokenLanguage?: string;
  videoId?: string;
  captionFile?: string;
  audioTrackFile?: string;
  language?: string;
  captionLanguage?: string;
  notifySubscribers?: string;
  playlistId?: string;
  isMadeForKids?: string;
  mediaComponentId?: string;
  textLanguage?: string;
}

export enum SpreadsheetTemplateType {
  UPLOAD = "upload",
  LOCALIZATION = "localization",
}
@Injectable()
export class SpreadSheetsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly batchService: BatchService,
    private readonly bullMQService: BullMQService
  ) {}

  async getSpreadSheetTemplateData(input: {
    data?: SpreadsheetRow[];
  }): Promise<{
    templateType: SpreadsheetTemplateType;
    spreadsheetData: SpreadsheetRow[];
  }> {
    for (const row of input.data ?? []) {
      if (row.channel != null) {
        row.channelData = (await this.prismaService.channel.findFirst({
          where: { youtubeId: row.channel },
        })) as Channel;
      }

      if (row.channel != null) {
        row.channelData = (await this.prismaService.channel.findFirst({
          where: { youtubeId: row.channel },
        })) as Channel;
      }

      // if (row.videoId != null) {
      //   // Populate Resource Data
      //   row.resourceData = (await this.prismaService.resource.findFirst({
      //     where: { resourceLocalizations: { some: { videoId: row.videoId } } },
      //     include: {
      //       resourceLocalizations: true,
      //       resourceChannels: {
      //         where: { channel: { youtubeId: row.videoId } },
      //       },
      //     },
      //   })) as Resource;

      //   // Populate Channel Data
      //   row.channelData =
      //     (
      //       await this.prismaService.resource.findFirst({
      //         where: {
      //           resourceLocalizations: { some: { videoId: row.videoId } },
      //         },
      //         include: {
      //           resourceLocalizations: true,
      //           resourceChannels: {
      //             include: { channel: true },
      //             where: { channel: { youtubeId: row.videoId } },
      //           },
      //         },
      //       })
      //     )?.resourceChannels[0]?.channel ?? undefined;
      // }

      if (row.videoId != null) {
        // Populate Resource Data
        row.resourceData = (await this.prismaService.resource.findFirst({
          where: { resourceLocalizations: { some: { videoId: row.videoId } } },
          include: {
            resourceLocalizations: true,
            resourceChannels: {
              include: {
                channel: true, // Explicitly include the channel here
              },
            },
          },
        })) as Resource;

        // Populate Channel Data
        row.channelData =
          (
            await this.prismaService.channel.findFirst({
              where: {
                resourceChannels: { some: { resourceId: row.resourceData.id } },
              },
              include: {
                resourceChannels: {
                  include: {
                    channel: true, // Make sure to include this to access 'channel' property
                  },
                  where: {
                    resource: {
                      resourceLocalizations: { some: { videoId: row.videoId } },
                    },
                  },
                },
              },
            })
          )?.resourceChannels[0]?.channel ?? undefined;
      }
    }

    let templateType = SpreadsheetTemplateType.UPLOAD;
    const inputData = input.data ?? [];
    if (inputData?.length > 0 && inputData[0]?.videoId != null) {
      templateType = SpreadsheetTemplateType.LOCALIZATION;
    }

    return {
      spreadsheetData: inputData,
      templateType,
    };
  }

  async processUploadSpreadsheetTemplate(
    token: string,
    spreadsheetRows: SpreadsheetRow[]
  ): Promise<Resource[]> {
    // UPLOADING TEMPLATE DATA
    const allResources: Resource[] = [];

    // Find Unique Channels
    const channels = Array.from(
      new Set(
        spreadsheetRows
          .filter((spreadsheetRow) => spreadsheetRow.channelData != null)
          .map((spreadsheetRow) => spreadsheetRow.channelData?.id)
      )
    );

    for (const channel of channels) {
      const resources = await this.createResourceFromSpreadsheet(
        spreadsheetRows.filter(
          (spreadsheetRow) => spreadsheetRow.channelData?.id === channel
        )
      );
      await this.bullMQService.createUploadResourceBatch(
        token,
        uuidv4(),
        spreadsheetRows.find((item) => item.channelData?.id === channel)
          ?.channelData as Channel,
        resources
      );

      allResources.concat(resources);
    }
    return allResources;
  }

  async createResourceFromSpreadsheet(
    spreadsheetRows: SpreadsheetRow[]
  ): Promise<Resource[]> {
    const resources: Resource[] = [];
    for (const row of spreadsheetRows) {
      const resource = await this.prismaService.resource.create({
        data: {
          id: uuidv4(),
          name: row.filename ?? "",
          status: row.channelData?.id !== null ? "processing" : "done",
          createdAt: new Date(),
          customThumbnail: row.customThumbnail,
          category: row.category,
          privacy: row.privacy as PrivacyStatus,
          notifySubscribers: ["1", "true", "yes", "on", "y"].includes(
            row.notifySubscribers?.toLocaleUpperCase() ?? ""
          ),
          playlistId: row.playlistId,
          isMadeForKids: ["1", "true", "yes", "on", "y"].includes(
            row.isMadeForKids?.toLocaleLowerCase() ?? ""
          ),
          mediaComponentId: row.mediaComponentId,
          language: row.language ?? "en",
          resourceLocalizations: {
            create: {
              title: row.title ?? "",
              description: row.description ?? "",
              keywords: row.keywords ?? "",
              language: row.textLanguage ?? "en",
              audioTrackFile: row.audioTrackFile ?? "",
              captionFile: row.captionFile ?? "",
            },
          },
        },
      });
      if (row.channelData !== undefined && resource !== null) {
        resources.push(resource);
      }
    }
    return resources;
  }

  async processLocalizationTemplateBatches(
    accessToken: string,
    spreadsheetData: SpreadsheetRow[]
  ): Promise<void> {
    const preparedBatchJobs =
      await this.batchService.createUpdateResourcesLocalization(
        spreadsheetData
      );
    for (const preparedBatchJob of preparedBatchJobs) {
      await this.bullMQService.createLocalizationBatch(
        accessToken,
        uuidv4(),
        preparedBatchJob.channel,
        preparedBatchJob.resourceIds
      );
    }
  }
}
