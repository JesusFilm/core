import { Injectable } from '@nestjs/common';
import { drive_v3, google, sheets_v4 } from 'googleapis';

import { Channel, Resource } from '.prisma/api-nexus-client';

import { PrismaService } from '../prisma.service';

export interface SpreadsheetRow {
  videoDriveFile?: drive_v3.Schema$File;
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
  captionDriveFile?: drive_v3.Schema$File;
  audioTrackFile?: string;
  audioTrackDriveFile?: drive_v3.Schema$File;
  language?: string;
  customThumbnailDriveFile?: drive_v3.Schema$File;
  captionLanguage?: string;
  notifySubscribers?: string;
  notifySubscriber?: boolean;
  playlistId?: string;
  isMadeForKids?: boolean;
  mediaComponentId?: string;
  textLanguage?: string;
}

export enum SpreadsheetTemplateType {
  UPLOAD = 'upload',
  LOCALIZATION = 'localization',
}

@Injectable()
export class GoogleSheetsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getFirstSheetName(
    spreadsheetId: string,
    accessToken: string,
  ): Promise<string> {
    const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;
    const response = await fetch(metadataUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const metadata = await response.json();
    return metadata.sheets[0].properties.title;
  }

  async downloadSpreadsheet(
    spreadsheetId: string,
    sheetName: string,
    accessToken: string,
  ): Promise<unknown[][]> {
    const sheetsApiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      sheetName,
    )}`;
    const response = await fetch(sheetsApiUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    return data.values;
  }

  private async getGoogleSheetData(
    auth,
    spreadsheetId: string,
    range?: string,
  ): Promise<any[][]> {
    const sheets = google.sheets({ version: 'v4', auth });
    const sheetsResponse = await sheets.spreadsheets.get({
      spreadsheetId,
      includeGridData: false,
    });
    const sheetsInfo = sheetsResponse.data.sheets as sheets_v4.Schema$Sheet[];
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: range ?? sheetsInfo[0]?.properties?.title ?? '',
    });
    return response.data.values ?? [];
  }

  async getGoogleSheetRowsData(props: {
    auth;
    spreadsheetId: string;
    range?: string;
    files?: drive_v3.Schema$File[];
  }): Promise<{
    spreadsheetRows: SpreadsheetRow[];
    spreadsheetTemplateType: SpreadsheetTemplateType;
  } | null> {
    const rows = await this.getGoogleSheetData(
      props.auth,
      props.spreadsheetId,
      props.range,
    );
    if (rows.length > 1) {
      let spreadsheetTemplateType = SpreadsheetTemplateType.UPLOAD;
      const headers = rows.shift()?.map((header) =>
        header
          .toString()
          .toLowerCase()
          .replace(/[-_]+/g, ' ')
          .replace(/ (.)/g, ($txt) => $txt.toUpperCase())
          .replace(/ /g, '')
          .replace(/^./, ($txt) => $txt.toLowerCase()),
      );
      const spreadsheetRows: SpreadsheetRow[] = [];
      for (const row of rows) {
        const obj = {};
        headers?.forEach((header, index) => {
          obj[header] = row[index];
        });
        const item = await this.getSpreadSheetRow(obj, props.files);
        spreadsheetTemplateType =
          item.videoId != null
            ? SpreadsheetTemplateType.LOCALIZATION
            : SpreadsheetTemplateType.UPLOAD;
        spreadsheetRows.push(item);
      }
      return { spreadsheetRows, spreadsheetTemplateType };
    } else {
      return null;
    }
  }

  private async getSpreadSheetRow(
    obj: any,
    files?: drive_v3.Schema$File[],
  ): Promise<SpreadsheetRow> {
    const row: SpreadsheetRow = obj as SpreadsheetRow;
    if (row.filename != null) {
      row.videoDriveFile = files?.find((file) => file.name === row.filename);
    }

    if (row.customThumbnail != null) {
      row.customThumbnailDriveFile = files?.find(
        (file) => file.name === row.customThumbnail,
      );
    }

    if (row.audioTrackFile != null) {
      row.audioTrackDriveFile = files?.find(
        (file) => file.name === row.audioTrackFile,
      );
    }

    if (row.channel != null) {
      row.channelData = (await this.prismaService.channel.findFirst({
        where: { youtube: { youtubeId: row.channel } },
      })) as Channel;
    }

    if (row.videoId != null) {
      row.resourceData = (await this.prismaService.resource.findFirst({
        where: {},
      })) as Resource;
    }

    if (row.notifySubscribers != null) {
      row.notifySubscriber =
        row.notifySubscribers.toLowerCase() === 'true' ||
        row.notifySubscribers.toLowerCase() === '1' ||
        row.notifySubscribers.toLowerCase() === 'yes';
    }
    return row;
  }
}
