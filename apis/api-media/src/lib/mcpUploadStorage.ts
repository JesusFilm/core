import {
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'

import { uploadChunkBytes } from '@core/yoga/mcp/mediaJobContract'

export interface UploadStorage {
  put(key: string, bytes: Buffer): Promise<void | 'rejected'>
  get(key: string): Promise<Buffer>
  removeJob(jobId: string): Promise<void>
}

/** No presigned or public access. Runtime credentials stay in media. Encryption
 * and bucket public-access/least-privilege policy are deployment requirements.
 */
export function s3UploadStorage(bucket: string): UploadStorage {
  // A later rejection cannot qualify an earlier, automatically retried send.
  const client = new S3Client({ maxAttempts: 1 })
  const keyFor = (key: string) => {
    if (!/^[a-f0-9-]{36}\/[0-9]+-[a-f0-9]{64}$/.test(key))
      throw new Error('Invalid staging key')
    return `mcp-input/${key}`
  }
  return {
    async put(key, bytes) {
      try {
        await client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: keyFor(key),
            Body: bytes,
            ServerSideEncryption: 'AES256',
            ContentType: 'application/octet-stream'
          })
        )
      } catch (error) {
        const failure = error as {
          name?: string
          $metadata?: { httpStatusCode?: number; attempts?: number }
        }
        const status = failure.$metadata?.httpStatusCode
        if (
          failure.$metadata?.attempts === 1 &&
          ((status === 403 &&
            [
              'AccessDenied',
              'InvalidAccessKeyId',
              'SignatureDoesNotMatch'
            ].includes(failure.name ?? '')) ||
            (status === 400 && failure.name === 'EntityTooLarge'))
        )
          return 'rejected'
        throw error
      }
    },
    async get(key) {
      const response = await client.send(
        new GetObjectCommand({ Bucket: bucket, Key: keyFor(key) })
      )
      if (
        !response.Body ||
        !response.ContentLength ||
        response.ContentLength > uploadChunkBytes
      )
        throw new Error('Invalid staging object')
      const parts: Uint8Array[] = []
      let size = 0
      for await (const part of response.Body as AsyncIterable<Uint8Array>) {
        size += part.length
        if (size > uploadChunkBytes) throw new Error('Invalid staging object')
        parts.push(part)
      }
      return Buffer.concat(parts)
    },
    async removeJob(jobId) {
      if (!/^[a-f0-9-]{36}$/.test(jobId)) throw new Error('Invalid staging key')
      let token: string | undefined
      do {
        const page = await client.send(
          new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: `mcp-input/${jobId}/`,
            ContinuationToken: token
          })
        )
        if (page.Contents?.length) {
          const result = await client.send(
            new DeleteObjectsCommand({
              Bucket: bucket,
              Delete: { Objects: page.Contents.map(({ Key }) => ({ Key })) }
            })
          )
          if (result.Errors?.length)
            throw new Error('Staging cleanup incomplete')
        }
        token = page.NextContinuationToken
      } while (token)
    }
  }
}
