import { createWriteStream, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'

import { Injectable } from '@nestjs/common/decorators/core'
import { v4 as uuidv4 } from 'uuid'

import * as http from 'node:http'
import * as https from 'node:https'

interface DownloadFileOptions {
  fileUrl: string
  progressCallback?: (progress: number) => Promise<void>
}

@Injectable()
export class FileService {
  private async executeCallback(
    progressCallback:
      | ((percentage: number) => Promise<void>)
      | null
      | undefined,
    progress: number
  ): Promise<void> {
    if (progressCallback != null) {
      await progressCallback(progress)
    }
  }

  public generateGoogleDriveDirectLink(shareUrl: string): string {
    const fileIdMatch = shareUrl.match(/\/file\/d\/([^\/]+)\//)
    console.log('fileIdMatch:', fileIdMatch)
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`
    }
    throw new Error('Invalid Google Drive share URL')
  }

  getFileNameFromContentDisposition(
    contentDisposition: string | undefined
  ): string | null {
    if (!contentDisposition) return null
    const fileNameMatch = contentDisposition.match(/filename="([^"]+)"/)
    return fileNameMatch ? fileNameMatch[1] : null
  }

  async downloadFile({
    fileUrl,
    progressCallback
  }: DownloadFileOptions): Promise<string> {
    try {
      const urlObj = new URL(fileUrl)
      const isGoogleDrive = urlObj.hostname === 'drive.google.com'

      const directFileUrl = isGoogleDrive
        ? this.generateGoogleDriveDirectLink(fileUrl)
        : fileUrl
      const protocol = directFileUrl.startsWith('https') ? https : http
      return new Promise((resolve, reject) => {
        const handleResponse = (response: http.IncomingMessage) => {
          if (!response.statusCode) {
            return reject(new Error('Response has no status code'))
          }

          if (
            response.statusCode >= 300 &&
            response.statusCode < 400 &&
            response.headers.location
          ) {
            const redirectUrl = new URL(
              response.headers.location,
              directFileUrl
            ).toString()
            protocol.get(redirectUrl, handleResponse).on('error', reject)
            return
          }

          if (response.statusCode !== 200) {
            return reject(
              new Error(
                `Failed to get '${directFileUrl}' (${response.statusCode})`
              )
            )
          }

          const totalLength = Number.parseInt(
            response.headers['content-length'] ?? '0',
            10
          )
          let downloadedLength = 0

          const downloadDirectory = path.join(__dirname, '..', 'downloads')
          if (!existsSync(downloadDirectory)) {
            mkdirSync(downloadDirectory, { recursive: true })
            console.log('Created download directory:', downloadDirectory)
          }

          let fileName = this.getFileNameFromContentDisposition(
            response.headers['content-disposition']
          )
          if (!fileName) {
            fileName = uuidv4()
          }

          const outputPath = path.join(downloadDirectory, fileName)
          const writer = createWriteStream(outputPath)

          response.pipe(writer)

          response.on('data', (chunk: Buffer) => {
            downloadedLength += chunk.length
            const percentage = totalLength
              ? (downloadedLength / totalLength) * 100
              : 0
            this.executeCallback(progressCallback, percentage)
          })

          writer.on('finish', () => {
            console.log('Download finished:', outputPath)
            resolve(outputPath)
          })
          writer.on('error', (error) => {
            console.error('Writer error:', error)
            reject(error)
          })
        }

        protocol.get(directFileUrl, handleResponse).on('error', (error) => {
          reject(error)
        })
      })
    } catch (error) {
      console.error('Download file error:', error)
      throw error
    }
  }
}
