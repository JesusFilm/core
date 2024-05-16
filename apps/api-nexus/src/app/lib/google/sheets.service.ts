import { drive_v3 } from '@googleapis/drive'
import { sheets } from '@googleapis/sheets'
import { Injectable } from '@nestjs/common'
import { google, sheets_v4 } from 'googleapis'
import { v4 as uuidv4 } from 'uuid'

import { Channel, Resource } from '.prisma/api-nexus-client'

import { PrivacyStatus } from '../../__generated__/graphql'
import { BatchService } from '../../modules/batch/batch.service'
import { BullMQService } from '../bullMQ/bullMQ.service'
import { PrismaService } from '../prisma.service'

import { GoogleDriveService } from './drive.service'
import { GoogleOAuthService } from './oauth.service'

export interface SpreadsheetRow {
  videoDriveFile?: drive_v3.Schema$File
  channel?: string
  channelData?: Channel
  resourceData?: Resource
  filename?: string
  title?: string
  description?: string
  customThumbnail?: string
  keywords?: string
  category?: string
  privacy?: string
  spokenLanguage?: string
  videoId?: string
  captionFile?: string
  captionDriveFile?: drive_v3.Schema$File
  audioTrackFile?: string
  audioTrackDriveFile?: drive_v3.Schema$File
  language?: string
  customThumbnailDriveFile?: drive_v3.Schema$File
  captionLanguage?: string
  notifySubscribers?: string
  playlistId?: string
  isMadeForKids?: string
  mediaComponentId?: string
  textLanguage?: string
}

export enum SpreadsheetTemplateType {
  UPLOAD = 'upload',
  LOCALIZATION = 'localization'
}
@Injectable()
export class GoogleSheetsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly googleOAuthService: GoogleOAuthService,
    private readonly googleDriveService: GoogleDriveService,
    private readonly batchService: BatchService,
    private readonly bullMQService: BullMQService
  ) {}

  async getFirstSheetName(
    spreadsheetId: string,
    accessToken: string
  ): Promise<string | undefined> {
    const client = sheets({ version: 'v4', auth: accessToken })
    const res = await client.spreadsheets.get({ spreadsheetId })
    return res.data.sheets?.[0].properties?.title ?? undefined
  }

  private async getGoogleSheetData(
    auth,
    spreadsheetId: string,
    range?: string
  ): Promise<string[][]> {
    const sheets = google.sheets({ version: 'v4', auth })
    const sheetsResponse = await sheets.spreadsheets.get({
      spreadsheetId,
      includeGridData: false
    })
    const sheetsInfo = sheetsResponse.data.sheets as sheets_v4.Schema$Sheet[]
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: range ?? sheetsInfo[0]?.properties?.title ?? ''
    })
    return response.data.values ?? []
  }

  async downloadSpreadsheet(
    spreadsheetId: string,
    sheetName: string,
    accessToken: string
  ): Promise<unknown[][] | undefined> {
    const client = sheets({ version: 'v4', auth: accessToken })
    const res = await client.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName
    })
    return res.data.values ?? undefined
  }

  async getSpreadSheetTemplateData(
    tokenId: string,
    spreadsheetId: string,
    drivefolderId: string
  ): Promise<{
    templateType: SpreadsheetTemplateType
    spreadsheetData: SpreadsheetRow[]
    googleAccessToken: { id: string; refreshToken: string }
  }> {
    const googleAccessToken =
      await this.prismaService.googleAccessToken.findUnique({
        where: { id: tokenId }
      })
    if (googleAccessToken === null) {
      throw new Error('Invalid tokenId')
    }

    const accessToken = await this.googleOAuthService.getNewAccessToken(
      googleAccessToken.refreshToken
    )

    const files = await this.googleDriveService.findFiles(
      this.googleOAuthService.authorize(
        accessToken,
        'https://www.googleapis.com/auth/drive'
      ),
      drivefolderId
    )

    const spreadsheetRowData = await this.getGoogleSheetRowsData({
      auth: this.googleOAuthService.authorize(
        accessToken,
        'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets'
      ),
      spreadsheetId,
      files: files ?? []
    })

    return {
      spreadsheetData: spreadsheetRowData?.spreadsheetRows ?? [],
      templateType:
        spreadsheetRowData?.spreadsheetTemplateType ??
        SpreadsheetTemplateType.UPLOAD,
      googleAccessToken
    }
  }

  async processUploadSpreadsheetTemplate(
    googleAccessToken: { id: string; refreshToken: string },
    spreadsheetRows: SpreadsheetRow[]
  ): Promise<Resource[]> {
    // UPLOADING TEMPLATE DATA
    const allResources: Resource[] = []

    // Find Unique Channels
    const channels = Array.from(
      new Set(
        spreadsheetRows
          .filter((spreadsheetRow) => spreadsheetRow.channelData != null)
          .map((spreadsheetRow) => spreadsheetRow.channelData?.id)
      )
    )
    for (const channel of channels) {
      const resources = await this.createResourceFromSpreadsheet(
        googleAccessToken.refreshToken,
        spreadsheetRows.filter(
          (spreadsheetRow) => spreadsheetRow.channelData?.id === channel
        )
      )
      await this.bullMQService.createUploadResourceBatch(
        uuidv4(),
        spreadsheetRows.find((item) => item.channelData?.id === channel)
          ?.channelData as Channel,
        resources
      )

      allResources.concat(resources)
    }
    return allResources
  }

  async createResourceFromSpreadsheet(
    refreshToken: string,
    spreadsheetRows: SpreadsheetRow[]
  ): Promise<Resource[]> {
    const resources: Resource[] = []
    for (const row of spreadsheetRows) {
      const resource = await this.prismaService.resource.create({
        data: {
          id: uuidv4(),
          name: row.filename ?? '',
          status: row.channelData?.id !== null ? 'processing' : 'published',
          createdAt: new Date(),
          customThumbnail: row.customThumbnail,
          category: row.category,
          privacy: row.privacy as PrivacyStatus,
          notifySubscribers:  ['1', 'true', 'yes', 'on'].includes(row.notifySubscribers ?? ''),
          playlistId: row.playlistId,
          isMadeForKids:  ['1', 'true', 'yes', 'on'].includes(row.isMadeForKids ?? ''),
          mediaComponentId: row.mediaComponentId,
          language: row.language,
          resourceLocalizations: {
            create: {
              title: row.title ?? '',
              description: row.description ?? '',
              keywords: row.keywords ?? '',
              language: row.textLanguage ?? '',
              audioTrackFile: row.audioTrackFile ?? '',
              captionFile: row.captionFile ?? '',
              resourceLocalizationSource: {
                create: {
                  captionGoogleDriveId: row.captionDriveFile?.id ?? '',
                  captionGoogleDriveRefreshToken: refreshToken,
                  audioTrackGoogleDriveId: row.audioTrackDriveFile?.id,
                  audioTrackGoogleDriveRefreshToken: refreshToken
                }
              }
            }
          },
          resourceSource: {
            create: {
              videoMimeType: row.videoDriveFile?.mimeType ?? '',
              videoGoogleDriveId: row.videoDriveFile?.id ?? '',
              videoGoogleDriveRefreshToken: refreshToken,
              thumbnailGoogleDriveId: row.customThumbnailDriveFile?.id ?? '',
              thumbnailMimeType: row.customThumbnailDriveFile?.mimeType ?? '',
              thumbnailGoogleDriveRefreshToken: refreshToken
            }
          }
        }
      })
      if (row.channelData !== undefined && resource !== null) {
        resources.push(resource)
      }
    }
    return resources
  }

  async getGoogleSheetRowsData(props: {
    auth
    spreadsheetId: string
    range?: string
    files?: drive_v3.Schema$File[]
  }): Promise<{
    spreadsheetRows: SpreadsheetRow[]
    spreadsheetTemplateType: SpreadsheetTemplateType
  } | null> {
    const rows = await this.getGoogleSheetData(
      props.auth,
      props.spreadsheetId,
      props.range
    )
    if (rows.length > 1) {
      let spreadsheetTemplateType = SpreadsheetTemplateType.UPLOAD
      const headers = rows.shift()?.map((header) =>
        header
          .toString()
          .replace(/[-_]+/g, ' ')
          .replace(/ (.)/g, ($txt) => $txt.toUpperCase())
          .replace(/ /g, '')
          .replace(/^./, ($txt) => $txt.toLowerCase())
      )
      const spreadsheetRows: SpreadsheetRow[] = []
      for (const row of rows) {
        const obj = {}
        headers?.forEach((header, index) => {
          obj[header] = row[index]
        })
        const item = await this.populateSpreadSheetRow(
          obj as SpreadsheetRow,
          props.files
        )
        spreadsheetTemplateType =
          item.videoId != null
            ? SpreadsheetTemplateType.LOCALIZATION
            : SpreadsheetTemplateType.UPLOAD
        spreadsheetRows.push(item)
      }
      return { spreadsheetRows, spreadsheetTemplateType }
    } else {
      return null
    }
  }

  private async populateSpreadSheetRow(
    row: SpreadsheetRow,
    files?: drive_v3.Schema$File[]
  ): Promise<SpreadsheetRow> {
    if (row.filename != null) {
      row.videoDriveFile = files?.find((file) => file.name === row.filename)
    }

    if (row.textLanguage != null) {
      row.language = row.textLanguage
    }

    if (row.customThumbnail != null) {
      row.customThumbnailDriveFile = files?.find(
        (file) => file.name === row.customThumbnail
      )
    }

    if (row.captionFile != null) {
      row.captionDriveFile = files?.find(
        (file) => file.name === row.captionFile
      )
    }

    if (row.audioTrackFile != null) {
      row.audioTrackDriveFile = files?.find(
        (file) => file.name === row.audioTrackFile
      )
    }

    if (row.channel != null) {
      row.channelData = (await this.prismaService.channel.findFirst({
        where: { youtube: { youtubeId: row.channel } }
      })) as Channel
    }

    if (row.videoId != null) {
      // Populate Resource Data
      row.resourceData = (await this.prismaService.resource.findFirst({
        where: { resourceLocalizations: { some: { videoId: row.videoId } } },
        include: {
          resourceLocalizations: true,
          resourceChannels: { where: { youtubeId: row.videoId } }
        }
      })) as Resource

      // Populate Channel Data
      row.channelData =
        (
          await this.prismaService.resource.findFirst({
            where: {
              resourceLocalizations: { some: { videoId: row.videoId } }
            },
            include: {
              resourceLocalizations: true,
              resourceChannels: {
                where: { youtubeId: row.videoId },
                include: { channel: true }
              }
            }
          })
        )?.resourceChannels[0]?.channel ?? undefined
    }
    return row
  }

  async processLocalizationTemplateBatches(
    googleAccessToken: { id: string; refreshToken: string },
    spreadsheetData: SpreadsheetRow[]
  ): Promise<void> {
    const preparedBatchJobs =
      await this.batchService.createUpdateResourcesLocalization(
        googleAccessToken.refreshToken,
        spreadsheetData
      )
    for (const preparedBatchJob of preparedBatchJobs) {
      await this.bullMQService.createLocalizationBatch(
        uuidv4(),
        preparedBatchJob.channel,
        preparedBatchJob.resourceIds
      )
    }
  }
}
