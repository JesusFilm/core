import { createWriteStream } from 'fs';
import path from 'path';

import { Injectable } from '@nestjs/common/decorators/core';
import axios from 'axios';
import { drive_v3, google } from 'googleapis';
import { OAuth2Client } from 'googleapis-common';
import { v4 as uuidv4 } from 'uuid';

import { Channel } from '../../__generated__/graphql';
import { GoogleSheetsService } from '../../lib/googleAPI/googleSheetsService';
import { GoogleOAuthService } from '../../lib/googleOAuth/googleOAuth';
import { PrismaService } from '../../lib/prisma.service';
import { YoutubeService } from '../../lib/youtube/youtubeService';

interface FileRequest {
  fileId: string;
  accessToken: string;
}

interface FileResponse {
  kind: string;
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink: string;
}

interface SpreadsheetRow {
  driveFile?: drive_v3.Schema$File;
  channel?: string;
  channelData?: Channel;
  filename?: string;
  title?: string;
  description?: string;
  keywords?: string;
  category?: string;
  privacy?: string;
  spoken_language?: string;
}

@Injectable()
export class GoogleDriveService {
  rootUrl: string;
  constructor(
    private readonly prismaService: PrismaService,
    private readonly googleOAuthService: GoogleOAuthService,
    private readonly youtubeService: YoutubeService,
    private readonly googleSheetsService: GoogleSheetsService,
  ) {
    this.rootUrl = 'https://www.googleapis.com/drive/v3';
  }

  async getFile(req: FileRequest): Promise<FileResponse> {
    const response = await fetch(
      `${this.rootUrl}/files/${req.fileId}?fields=id,thumbnailLink,name,mimeType,kind`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${req.accessToken}`,
        },
      },
    );

    return await response.json();
  }

  async setFilePermission(req: {
    fileId: string;
    accessToken: string;
  }): Promise<void> {
    await fetch(`${this.rootUrl}/files/${req.fileId}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${req.accessToken}`,
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone',
      }),
    });
  }

  async downloadDriveFile(
    data: { fileId: string; accessToken: string },
    progressCallback?: (progress: number) => Promise<void>,
  ): Promise<string> {
    await this.setFilePermission({
      fileId: data.fileId,
      accessToken: data.accessToken,
    });
    const fileUrl = this.getFileUrl(data.fileId);
    const response = await axios({
      method: 'get',
      url: fileUrl,
      responseType: 'stream',
    });

    const filename = response.headers['content-disposition']
      .split('filename=')[1]
      .split(';')[0]
      .replace(/["']/g, '');

    const downloadDirectory = path.join(__dirname, '..', 'downloads');
    const fileName = uuidv4() + path.extname(filename);
    const outputPath = path.join(downloadDirectory, fileName);
    const writer = createWriteStream(outputPath);

    const totalLength = response.headers['content-length'];
    let downloadedLength = 0;
    response.data.on('data', async (chunk: Buffer) => {
      downloadedLength += chunk.length;
      const percentage = ((downloadedLength / totalLength) * 100).toFixed(2);
      if (progressCallback != null) {
        await progressCallback(Number(percentage));
      }
    });
    response.data.pipe(writer);
    return await new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(outputPath));
      writer.on('error', reject);
    });
  }

  getFileUrl(fileId: string): string {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  async findFile(
    auth: OAuth2Client,
    folderId: string,
    fileName: string,
  ): Promise<drive_v3.Schema$File | null> {
    const drive = google.drive({ version: 'v3', auth });
    const driveResponse = await drive.files.list({
      q: `'${folderId}' in parents and name='${fileName}' and trashed=false`,
      fields: 'files(id, name, mimeType, kind)',
    });

    return driveResponse.data.files?.[0] ?? null;
  }

  async findFiles(
    auth: OAuth2Client,
    folderId: string,
  ): Promise<drive_v3.Schema$File[] | undefined> {
    const drive = google.drive({ version: 'v3', auth });
    const driveResponse = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType, kind)',
    });

    return driveResponse.data.files;
  }

  async handleGoogleDriveOperations(
    tokenId: string,
    spreadsheetId: string,
    drivefolderId: string,
  ): Promise<SpreadsheetRow[]> {
    const googleAccessToken =
      await this.prismaService.googleAccessToken.findUnique({
        where: { id: tokenId },
      });

    if (googleAccessToken === null) {
      throw new Error('Invalid tokenId');
    }

    console.log('googleAccessToken');
    const accessToken = await this.googleOAuthService.getNewAccessToken(
      googleAccessToken.refreshToken,
    );

    console.log('getFirstSheetName');
    const firstSheetName = await this.googleSheetsService.getFirstSheetName(
      spreadsheetId,
      accessToken,
    );

    console.log('downloadSpreadsheet');
    const spreadsheetData = await this.googleSheetsService.downloadSpreadsheet(
      spreadsheetId,
      firstSheetName,
      accessToken,
    );

    console.log('Prepare spreadsheetRows');
    let spreadsheetRows: SpreadsheetRow[] = [];

    if (spreadsheetData.length > 0) {
      const header = spreadsheetData[0] as string[];
      spreadsheetRows = spreadsheetData.slice(1).map((row) => {
        const rowObject = {};

        row.forEach((value, index) => {
          rowObject[header[index]] = value;
        });

        return rowObject as SpreadsheetRow;
      });
    }

    console.log('Authorize');
    // const authClient = this.youtubeService.authorize(accessToken);

    console.log('Find Files');
    // const files = await this.findFiles(authClient, drivefolderId);

    console.log('Authorize spreadsheetRows');
    // for (const spreadsheetRow of spreadsheetRows) {
    //   spreadsheetRow.driveFile = files?.find((file) => {
    //     return file.name === spreadsheetRow.filename;
    //   });
    //   console.log('spreadsheetRow.driveFile', spreadsheetRow.driveFile);
    //   spreadsheetRow.channelData = (await this.prismaService.channel.findFirst({
    //     where: { youtube: { youtubeId: spreadsheetRow.channel as string } },
    //     include: { youtube: true },
    //   })) as Channel | undefined;
    // }

    return spreadsheetRows;
  }
}
