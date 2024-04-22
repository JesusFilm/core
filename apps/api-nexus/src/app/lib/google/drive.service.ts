import { createWriteStream } from 'fs'
import path from 'path'

import { drive, drive_v3 } from '@googleapis/drive'
import { Injectable } from '@nestjs/common/decorators/core'
import axios from 'axios'
import { OAuth2Client } from 'googleapis-common'
import { v4 as uuidv4 } from 'uuid'

import { Channel } from '../../__generated__/graphql'
import { PrismaService } from '../prisma.service'

import { GoogleOAuthService } from './oauth.service'
import { GoogleSheetsService } from './sheets.service'

interface FileRequest {
  fileId: string
  accessToken: string
}

type FileResponse = Pick<
  drive_v3.Schema$File,
  'id' | 'name' | 'mimeType' | 'thumbnailLink' | 'kind'
>

interface SpreadsheetRow {
  driveFile?: drive_v3.Schema$File
  channel?: string
  channelData?: Channel
  filename?: string
  title?: string
  description?: string
  keywords?: string
  category?: string
  privacy?: string
  spoken_language?: string
}

@Injectable()
export class GoogleDriveService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly googleOAuthService: GoogleOAuthService,
    private readonly googleSheetsService: GoogleSheetsService
  ) {}

  async getFile({ fileId, accessToken }: FileRequest): Promise<FileResponse> {
    const client = drive({ version: 'v3', auth: accessToken })
    const res = await client.files.get({
      fileId,
      fields: 'id,name,mimeType,thumbnailLink,kind'
    })
    return res.data
  }

  async setFilePermission({ fileId, accessToken }: FileRequest): Promise<void> {
    const client = drive({ version: 'v3', auth: accessToken })
    await client.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    })
  }

  async downloadDriveFile(
    data: { fileId: string; accessToken: string },
    progressCallback?: (progress: number) => Promise<void>
  ): Promise<string> {
    await this.setFilePermission({
      fileId: data.fileId,
      accessToken: data.accessToken
    })
    const fileUrl = this.getFileUrl(data.fileId)
    const response = await axios({
      method: 'get',
      url: fileUrl,
      responseType: 'stream'
    })

    const filename = response.headers['content-disposition']
      .split('filename=')[1]
      .split(';')[0]
      .replace(/["']/g, '')

    const downloadDirectory = path.join(__dirname, '..', 'downloads')
    const fileName = uuidv4() + path.extname(filename)
    const outputPath = path.join(downloadDirectory, fileName)
    const writer = createWriteStream(outputPath)

    const totalLength = response.headers['content-length']
    let downloadedLength = 0
    response.data.on('data', async (chunk: Buffer) => {
      downloadedLength += chunk.length
      const percentage = ((downloadedLength / totalLength) * 100).toFixed(2)
      if (progressCallback != null) {
        await progressCallback(Number(percentage))
      }
    })
    response.data.pipe(writer)
    return await new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(outputPath))
      writer.on('error', reject)
    })
  }

  getFileUrl(fileId: string): string {
    return `https://drive.google.com/uc?export=download&id=${fileId}`
  }

  async findFile(
    auth: OAuth2Client,
    folderId: string,
    fileName: string
  ): Promise<drive_v3.Schema$File | null> {
    const client = drive({ version: 'v3', auth })
    const driveResponse = await client.files.list({
      q: `'${folderId}' in parents and name='${fileName}' and trashed=false`,
      fields: 'files(id, name, mimeType, kind)'
    })

    return driveResponse.data.files?.[0] ?? null
  }

  async findFiles(
    auth: OAuth2Client,
    folderId: string
  ): Promise<drive_v3.Schema$File[] | undefined> {
    const client = drive({ version: 'v3', auth })
    const driveResponse = await client.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType, kind)'
    })

    return driveResponse.data.files
  }

  async handleGoogleDriveOperations(
    tokenId: string,
    spreadsheetId: string,
    drivefolderId: string
  ): Promise<SpreadsheetRow[]> {
    const googleAccessToken =
      await this.prismaService.googleAccessToken.findUnique({
        where: { id: tokenId }
      })

    if (googleAccessToken === null) {
      throw new Error('Invalid tokenId')
    }

    console.log('googleAccessToken')
    const accessToken = await this.googleOAuthService.getNewAccessToken(
      googleAccessToken.refreshToken
    )

    console.log('getFirstSheetName')
    const firstSheetName = await this.googleSheetsService.getFirstSheetName(
      spreadsheetId,
      accessToken
    )

    if (firstSheetName == null)
      throw new Error('Spreadsheet does not contain first sheet')

    console.log('downloadSpreadsheet')
    const spreadsheetData = await this.googleSheetsService.downloadSpreadsheet(
      spreadsheetId,
      firstSheetName,
      accessToken
    )

    console.log('Prepare spreadsheetRows')
    let spreadsheetRows: SpreadsheetRow[] = []

    if (spreadsheetData != null && spreadsheetData.length > 0) {
      const header = spreadsheetData[0] as string[]
      spreadsheetRows = spreadsheetData.slice(1).map((row) => {
        const rowObject = {}

        row.forEach((value, index) => {
          rowObject[header[index]] = value
        })

        return rowObject as SpreadsheetRow
      })
    }

    console.log('Authorize')
    // const authClient = this.youtubeService.authorize(accessToken);

    console.log('Find Files')
    // const files = await this.findFiles(authClient, drivefolderId);

    console.log('Authorize spreadsheetRows')
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

    return spreadsheetRows
  }
}
