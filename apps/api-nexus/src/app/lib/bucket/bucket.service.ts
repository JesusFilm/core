import { readFileSync } from 'fs'
import { basename } from 'path'

import {
  CompleteMultipartUploadCommandOutput,
  S3Client
} from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { Injectable } from '@nestjs/common'

@Injectable()
export class BucketService {
  async uploadFile(
    filePath: string,
    bucketName: string,
    progressCallback?: (progress: number) => Promise<void>
  ): Promise<CompleteMultipartUploadCommandOutput> {
    if (
      process.env.BUCKET_ACCESS_KEY == null ||
      process.env.BUCKET_SECRET_KEY == null
    )
      throw new Error('AWS credentials not found')

    const client = new S3Client({
      region: process.env.BUCKET_REGION,
      endpoint: process.env.BUCKET_ENDPOINT,
      credentials: {
        accessKeyId: process.env.BUCKET_ACCESS_KEY,
        secretAccessKey: process.env.BUCKET_SECRET_KEY
      }
    })

    const fileContent = readFileSync(filePath)
    const bucketFile = new Upload({
      client,
      params: {
        Bucket: bucketName,
        Key: basename(filePath),
        Body: fileContent
      }
    })

    bucketFile.on('httpUploadProgress', (progress) => {
      const percentage = ((progress.loaded ?? 0) / (progress.total ?? 1)) * 100
      void Promise.all([this.executeCallback(progressCallback, percentage)])
    })

    return await bucketFile.done()
  }

  private async executeCallback(
    progressCallback: ((arg0: number) => Promise<void>) | null | undefined,
    progress: number
  ): Promise<void> {
    if (progressCallback != null) {
      await progressCallback(progress)
    }
  }
}
