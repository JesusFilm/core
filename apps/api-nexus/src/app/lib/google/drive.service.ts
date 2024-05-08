import { createWriteStream } from 'fs'
import path from 'path'

import { drive, drive_v3 } from '@googleapis/drive'
import { Injectable } from '@nestjs/common/decorators/core'
import axios from 'axios'
import { OAuth2Client } from 'googleapis-common'
import { v4 as uuidv4 } from 'uuid'

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

    const filename: string = response.headers['content-disposition']
      .split('filename=')[1]
      .split(';')[0]
      .replace(/["']/g, '') as string

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
}
