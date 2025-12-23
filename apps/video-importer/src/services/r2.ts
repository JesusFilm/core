import { S3Client } from 'bun'

import { env } from '../env'
import { getGraphQLClient } from '../gql/graphqlClient'
import { CREATE_CLOUDFLARE_R2_ASSET } from '../gql/mutations'
import { R2Asset } from '../types'

function getR2BucketClient(bucket: string): S3Client {
  return new S3Client({
    accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    endpoint: env.CLOUDFLARE_R2_ENDPOINT,
    // Cloudflare R2 uses "auto" region in most S3-compatible SDKs
    region: 'auto',
    bucket
  })
}

export async function createR2Asset({
  fileName,
  contentType,
  originalFilename,
  videoId,
  contentLength
}: {
  fileName: string
  contentType: string
  originalFilename: string
  videoId: string
  contentLength: number
}): Promise<R2Asset> {
  console.log(`[R2 Service] Creating R2 asset for videoId: ${videoId}`)
  console.log(
    `[R2 Service] File details: ${fileName} (${contentType}, ${contentLength} bytes)`
  )

  const client = await getGraphQLClient()

  try {
    const data: { cloudflareR2Create: R2Asset } = await client.request(
      CREATE_CLOUDFLARE_R2_ASSET,
      {
        input: {
          fileName,
          contentType,
          originalFilename,
          videoId,
          contentLength
        }
      }
    )

    console.log(
      `[R2 Service] Successfully created R2 asset: ${data.cloudflareR2Create.id}`
    )
    return data.cloudflareR2Create
  } catch (error) {
    console.error(
      `[R2 Service] Failed to create R2 asset for videoId: ${videoId}`,
      error
    )
    throw error
  }
}

export async function uploadToR2({
  uploadUrl,
  bucket,
  filePath,
  contentType,
  contentLength
}: {
  uploadUrl: string
  bucket: string
  filePath: string
  contentType: string
  contentLength: number
}) {
  const url = new URL(uploadUrl)
  const key = url.pathname.substring(1)

  console.log(
    `[R2 Service] Uploading ${(contentLength / 1024 / 1024).toFixed(1)}MB to R2 using multipart...`
  )

  const r2BucketClient = getR2BucketClient(bucket)
  const bytesWritten = await r2BucketClient.write(key, Bun.file(filePath), {
    type: contentType,
    // Match prior behavior (20MB parts, queueSize=2) for large files
    partSize: 20 * 1024 * 1024,
    queueSize: 2
  })

  console.log(`[R2 Service] Upload completed (${bytesWritten} bytes written)`)

  // Verify the uploaded file is retrievable
  await verifyFileUpload(r2BucketClient, key, contentLength)
  console.log('[R2 Service] File verification completed')
}

async function verifyFileUpload(
  r2BucketClient: S3Client,
  key: string,
  expectedContentLength: number
): Promise<void> {
  console.log('[R2 Service] Verifying uploaded file...')

  try {
    const uploadedSize = await r2BucketClient.size(key)
    if (uploadedSize !== expectedContentLength) {
      throw new Error(
        `File verification failed: Expected ${expectedContentLength} bytes, got ${uploadedSize} bytes`
      )
    }

    console.log(
      `[R2 Service] File verification successful: ${uploadedSize} bytes`
    )
  } catch (error) {
    console.error('[R2 Service] File verification failed:', error)
    throw new Error(
      `File verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

export async function uploadFileToR2Direct({
  bucket,
  key,
  filePath,
  contentType
}: {
  bucket: string
  key: string
  filePath: string
  contentType: string
}): Promise<string> {
  console.log(`[R2 Service] Uploading file to R2: ${key}`)
  const r2BucketClient = getR2BucketClient(bucket)
  await r2BucketClient.write(key, Bun.file(filePath), { type: contentType })

  console.log(`[R2 Service] Direct upload completed: ${key}`)

  const publicBaseUrl = `https://${bucket}.${new URL(env.CLOUDFLARE_R2_ENDPOINT).hostname}`

  return `${publicBaseUrl.replace(/\/$/, '')}/${key}`
}
