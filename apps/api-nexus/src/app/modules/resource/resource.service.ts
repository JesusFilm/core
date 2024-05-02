import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { Channel, Resource } from '.prisma/api-nexus-client';

import { PrivacyStatus } from '../../__generated__/graphql';
import {
  GoogleSheetsService,
  SpreadsheetRow,
  SpreadsheetTemplateType,
} from '../../lib/googleAPI/googleSheetsService';
import { GoogleOAuthService } from '../../lib/googleOAuth/googleOAuth';
import { PrismaService } from '../../lib/prisma.service';
import { BatchService } from '../batch/batchService';
import { BullMQService } from '../bullMQ/bullMQ.service';
import { GoogleDriveService } from '../google-drive/googleDriveService';

@Injectable()
export class ResourceService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly googleOAuthService: GoogleOAuthService,
    private readonly googleDriveService: GoogleDriveService,
    private readonly googleSheetsService: GoogleSheetsService,
    private readonly bullMQService: BullMQService,
    private readonly batchService: BatchService,
  ) {}

  async getSpreadSheetTemplateData(
    tokenId: string,
    spreadsheetId: string,
    drivefolderId: string,
  ): Promise<{
    templateType: SpreadsheetTemplateType;
    spreadsheetData: SpreadsheetRow[];
    googleAccessToken: { id: string; refreshToken: string };
  }> {
    const googleAccessToken =
      await this.prismaService.googleAccessToken.findUnique({
        where: { id: tokenId },
      });
    if (googleAccessToken === null) {
      throw new Error('Invalid tokenId');
    }

    const accessToken = await this.googleOAuthService.getNewAccessToken(
      googleAccessToken.refreshToken,
    );

    const files = await this.googleDriveService.findFiles(
      this.googleOAuthService.authorize(
        accessToken,
        'https://www.googleapis.com/auth/drive',
      ),
      drivefolderId,
    );

    const spreadsheetRowData =
      await this.googleSheetsService.getGoogleSheetRowsData({
        auth: this.googleOAuthService.authorize(
          accessToken,
          'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets',
        ),
        spreadsheetId,
        files: files ?? [],
      });

    return {
      spreadsheetData: spreadsheetRowData?.spreadsheetRows ?? [],
      templateType:
      spreadsheetRowData?.spreadsheetTemplateType ??
        SpreadsheetTemplateType.UPLOAD,
      googleAccessToken,
    };
  }

  async processUploadSpreadsheetTemplate(
    nexusId: string,
    googleAccessToken: { id: string; refreshToken: string },
    spreadsheetRows: SpreadsheetRow[],
  ): Promise<Resource[]> {
    // UPLOADING TEMPLATE DATA
    console.log('PREPARING UPLOAD-TEMPLATE DATA', spreadsheetRows);
    const allResources: Resource[] = [];
    // Find Unique Channels
    const channels = Array.from(
      new Set(
        spreadsheetRows
          .filter((spreadsheetRow) => spreadsheetRow.channelData != null)
          .map((spreadsheetRow) => spreadsheetRow.channelData),
      ),
    );
    console.log("channels", channels);
    for (const channel of channels) {
      const resources = await this.createResourceFromSpreadsheet(
        nexusId,
        googleAccessToken.refreshToken,
        spreadsheetRows.filter(
          (spreadsheetRow) => spreadsheetRow.channelData?.id === channel?.id,
        ),
      );
      allResources.concat(resources);
      await this.bullMQService.createUploadResourceBatch(
        uuidv4(),
        nexusId,
        channel as Channel,
        resources,
      );
    }
    return allResources;
  }

  async processLocalizationTemplateBatches(
    nexusId: string,
    googleAccessToken: { id: string; refreshToken: string },
    spreadsheetData: SpreadsheetRow[],
  ): Promise<Resource[]> {
    const batchLocalizations =
      await this.batchService.createResourcesLocalization(
        googleAccessToken.refreshToken,
        spreadsheetData,
      );
    console.log('batchLocalizations', batchLocalizations);
    const preparedBatchJobs =
      this.batchService.prepareBatchResourceLocalizationsForBatchJob(
        batchLocalizations,
      );
    console.log('preparedBatchJobs', preparedBatchJobs);
    for (const preparedBatchJob of preparedBatchJobs) {
      await this.bullMQService.createLocalizationBatch(
        uuidv4(),
        nexusId,
        preparedBatchJob.videoId,
        preparedBatchJob.channel,
        preparedBatchJob.localizations,
      );
    }
    return [];
  }

  async createResourceFromSpreadsheet(
    nexusId: string,
    refreshToken: string,
    data: SpreadsheetRow[],
  ): Promise<Resource[]> {
    const resources: Resource[] = [];
    for (const row of data) {
      const resource = await this.prismaService.resource.create({
        data: {
          id: uuidv4(),
          name: row.filename ?? '',
          nexusId,
          status: row.channelData?.id !== null ? 'processing' : 'published',
          createdAt: new Date(),
          customThumbnail: row.customThumbnail,
          category: row.category,
          privacy: row.privacy as PrivacyStatus,
          notifySubscribers: row.notifySubscriber ?? false,
          playlistId: row.playlistId,
          isMadeForKids: row.isMadeForKids,
          mediaComponentId: row.mediaComponentId,
          resourceLocalizations: {
            create: {
              title: row.title ?? '',
              description: row.description ?? '',
              keywords: row.keywords ?? '',
              language: row.textLanguage ?? '',
              captionFile: row.captionFile ?? '',
              resourceLocalizationSource: {
                create: {
                  captionGoogleDriveId: row.captionDriveFile?.id ?? '',
                  captionGoogleDriveRefreshToken: refreshToken,
                  audioTrackGoogleDriveId: row.audioTrackDriveFile?.id,
                  audioTrackGoogleDriveRefreshToken: refreshToken,
                },
              },
            },
          },
          resourceSource: {
            create: {
              videoMimeType: row.videoDriveFile?.mimeType ?? '',
              videoGoogleDriveId: row.videoDriveFile?.id ?? '',
              videoGoogleDriveRefreshToken: refreshToken,
              thumbnailGoogleDriveId: row.customThumbnailDriveFile?.id ?? '',
              thumbnailMimeType: row.customThumbnailDriveFile?.mimeType ?? '',
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
}
