import { createReadStream } from 'fs'

import { HeadObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'

import { env } from '../env'
import { getGraphQLClient } from '../gql/graphqlClient'
import { CREATE_CLOUDFLARE_R2_ASSET } from '../gql/mutations'
import { R2Asset } from '../types'

const MULTIPART_PART_SIZE = 20 * 1024 * 1024
const MULTIPART_QUEUE_SIZE = 2

type UploadFileStreamParams = {
  r2BucketClient: S3Client
  bucket: string
  key: string
  filePath: string
  contentType: string
  contentLength: number
}

function getR2BucketClient(): S3Client {
  return new S3Client({
    endpoint: env.CLOUDFLARE_R2_ENDPOINT,
    region: 'auto',
    credentials: {
      accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
    }
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

  const r2BucketClient = getR2BucketClient()
  await uploadFileStream({
    r2BucketClient,
    bucket,
    key,
    filePath,
    contentType,
    contentLength
  })

  console.log(`[R2 Service] Upload completed (${contentLength} bytes written)`)

  // Verify R2 has the exact object before handing the public URL to downstream consumers.
  await verifyFileUpload(r2BucketClient, bucket, key, contentLength)
  console.log('[R2 Service] File verification completed')
}

async function uploadFileStream({
  r2BucketClient,
  bucket,
  key,
  filePath,
  contentType,
  contentLength
}: UploadFileStreamParams): Promise<void> {
  const upload = new Upload({
    client: r2BucketClient,
    params: {
      Bucket: bucket,
      Key: key,
      Body: createReadStream(filePath),
      ContentType: contentType,
      ContentLength: contentLength
    },
    partSize: MULTIPART_PART_SIZE,
    queueSize: MULTIPART_QUEUE_SIZE
  })

  await upload.done()
}

async function verifyFileUpload(
  r2BucketClient: S3Client,
  bucket: string,
  key: string,
  expectedContentLength: number
): Promise<void> {
  console.log('[R2 Service] Verifying uploaded file...')

  try {
    const head = await r2BucketClient.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: key
      })
    )
    const uploadedSize = head.ContentLength ?? 0
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

export function formatR2AssetDiagnostic(r2Asset: R2Asset): string {
  const parts = [
    r2Asset.id != null ? `assetId=${r2Asset.id}` : undefined,
    r2Asset.fileName != null ? `fileName=${r2Asset.fileName}` : undefined,
    r2Asset.publicUrl != null ? `publicUrl=${r2Asset.publicUrl}` : undefined
  ].filter((part): part is string => part != null && part.length > 0)

  return parts.length > 0 ? ` (${parts.join(', ')})` : ''
}

export async function uploadFileToR2Direct({
  bucket,
  key,
  filePath,
  contentType,
  contentLength
}: {
  bucket: string
  key: string
  filePath: string
  contentType: string
  contentLength: number
}): Promise<string> {
  console.log(`[R2 Service] Uploading file to R2: ${key}`)
  const r2BucketClient = getR2BucketClient()
  await uploadFileStream({
    r2BucketClient,
    bucket,
    key,
    filePath,
    contentType,
    contentLength
  })

  console.log(`[R2 Service] Direct upload completed: ${key}`)

  await verifyFileUpload(r2BucketClient, bucket, key, contentLength)

  return `${env.CLOUDFLARE_R2_CUSTOM_DOMAIN.replace(/\/$/, '')}/${key}`
}
