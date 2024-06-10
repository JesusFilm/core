import { createWriteStream } from 'fs'
import path from 'path'

import { drive, drive_v3 } from '@googleapis/drive'
import { Injectable } from '@nestjs/common/decorators/core'
import { google } from 'googleapis'
import { OAuth2Client } from 'googleapis-common'
import { v4 as uuidv4 } from 'uuid'

import { GoogleOAuthService } from './oauth.service'

interface FileRequest {
  fileId: string
  accessToken: string
}

type FileResponse = Pick<
  drive_v3.Schema$File,
  'id' | 'name' | 'mimeType' | 'thumbnailLink' | 'kind'
>

@Injectable()
export class GoogleDriveService {
  constructor(private readonly googleOAuthService: GoogleOAuthService) {}

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
    { fileId, accessToken }: { fileId: string; accessToken: string },
    progressCallback?: (progress: number) => Promise<void>
  ): Promise<string> {
    const drive = google.drive({
      version: 'v3',
      auth: this.googleOAuthService.authorize(
        accessToken,
        'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file'
      )
    })
    const driveFile = await drive.files.get({
      fileId,
      fields: 'name, mimeType'
    })

    const downloadFileName = driveFile.data.name ?? 'sample.mp4'
    const downloadDirectory = path.join(__dirname, '..', 'downloads')
    const fileName = uuidv4() + path.extname(downloadFileName)
    const outputPath = path.join(downloadDirectory, fileName)
    const writer = createWriteStream(outputPath)

    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    )
    response.data.pipe(writer)

    const totalLength = response.headers['content-length']
    let downloadedLength = 0

    response.data.on('data', (chunk: Buffer) => {
      downloadedLength += chunk.length
      const percentage = (downloadedLength / totalLength) * 100
      void Promise.all([this.executeCallback(progressCallback, percentage)])
    })

    return await new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(outputPath))
      writer.on('error', reject)
    })
  }

  private async executeCallback(
    progressCallback: ((arg0: number) => Promise<void>) | null | undefined,
    progress: number
  ): Promise<void> {
    if (progressCallback != null) {
      await progressCallback(progress)
    }
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

  async getFileMetadata(
    fileId: string,
    accessToken?: string
  ): Promise<drive_v3.Schema$File> {
    let client

    if (accessToken) {
      const auth = new google.auth.OAuth2()
      auth.setCredentials({ access_token: accessToken })
      client = google.drive({ version: 'v3', auth })
    } else {
      client = google.drive({ version: 'v3' })
    }

    const file = await client.files.get({
      fileId,
      fields: 'id, name, mimeType, kind'
    })

    return file.data
  }

  extractFileIdFromUrl(url: string): string | null {
    const match = url.match(/[-\w]{25,}/)
    return match ? match[0] : null
  }
}
