import { createReadStream } from 'fs'

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import fetch from 'node-fetch'

import type { R2Asset } from '../types'

import { CREATE_CLOUDFLARE_R2_ASSET } from './gql/mutations'
import { getGraphQLClient } from './graphqlClient'

const MULTIPART_THRESHOLD = 100 * 1024 * 1024 // 100MB
const MULTIPART_PART_SIZE = 10 * 1024 * 1024 // 10MB

// Retry configurations
const MAX_RETRIES = 3
const RETRY_DELAY = 2000 // 2 seconds

// Large file optimizations
const LARGE_FILE_THRESHOLD = 1024 * 1024 * 1024 // 1GB
const LARGE_FILE_PART_SIZE = 50 * 1024 * 1024 // 50MB for very large files
const LARGE_FILE_QUEUE_SIZE = 8 // More concurrent parts for large files

// Remove timeout calculation - let R2 handle timeouts naturally

if (!process.env.CLOUDFLARE_R2_ENDPOINT) {
  throw new Error('CLOUDFLARE_R2_ENDPOINT environment variable is required')
}
if (!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID) {
  throw new Error(
    'CLOUDFLARE_R2_ACCESS_KEY_ID environment variable is required'
  )
}
if (!process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY) {
  throw new Error(
    'CLOUDFLARE_R2_SECRET_ACCESS_KEY environment variable is required'
  )
}

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
  }
})

// Utility function for retry logic with connection resilience
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY
): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Check if it's a connection-related error that should be retried
      const isRetryableError =
        error instanceof Error &&
        (error.message.includes('ECONNRESET') ||
          error.message.includes('ETIMEDOUT') ||
          error.message.includes('ENOTFOUND') ||
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('TimeoutError') ||
          error.message.includes('NetworkError'))

      if (attempt === maxRetries || !isRetryableError) {
        console.error(`[R2 Service] Final upload attempt failed:`, error)
        throw lastError
      }

      // Exponential backoff with jitter
      const backoffDelay =
        delay * Math.pow(2, attempt - 1) + Math.random() * 1000
      console.log(
        `[R2 Service] Upload attempt ${attempt} failed (${error.message}), retrying in ${Math.round(backoffDelay)}ms...`
      )
      await new Promise((resolve) => setTimeout(resolve, backoffDelay))
    }
  }

  throw lastError!
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
  const safeContentLength = contentLength > 2_147_483_647 ? -1 : contentLength

  try {
    const data: { cloudflareR2Create: R2Asset } = await client.request(
      CREATE_CLOUDFLARE_R2_ASSET,
      {
        input: {
          fileName,
          contentType,
          originalFilename,
          videoId,
          contentLength: safeContentLength
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

/**
 * Uploads a file to R2 using the best method for the file size.
 * For files <100MB, uses a single PUT to the pre-signed URL.
 * For files >=100MB, uses multipart upload via S3 API.
 * @param uploadUrl Pre-signed PUT URL (for small files and key extraction)
 * @param bucket R2 bucket name (for multipart)
 * @param filePath Local file path
 * @param contentType MIME type
 * @param contentLength File size in bytes
 */
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
  // Extract the key from the uploadUrl for multipart uploads
  const url = new URL(uploadUrl)
  const key = url.pathname.substring(1) // Remove leading slash

  if (contentLength < MULTIPART_THRESHOLD) {
    // Single PUT for small files
    console.log(
      `[R2 Service] Uploading ${(contentLength / 1024 / 1024).toFixed(1)}MB via single PUT`
    )

    return retryWithBackoff(async () => {
      const fileStream = createReadStream(filePath)
      fileStream.on('error', (err) => {
        throw new Error(`Failed to read file stream: ${err.message}`)
      })

      // Let R2 handle timeouts naturally - no manual timeout
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
          'Content-Length': contentLength.toString()
        },
        body: fileStream
      })

      if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(
          `Upload failed: ${response.status} ${response.statusText} - ${errorBody}`
        )
      }

      console.log('[R2 Service] Upload completed successfully')
    })
  }

  // Multipart upload for large files
  console.log(
    `[R2 Service] Uploading ${(contentLength / 1024 / 1024).toFixed(1)}MB via multipart upload`
  )

  return retryWithBackoff(async () => {
    const multipartStream = createReadStream(filePath)
    multipartStream.on('error', (err) => {
      throw new Error(
        `Failed to read file stream for multipart upload: ${err.message}`
      )
    })

    // Optimize upload configuration based on file size
    const isLargeFile = contentLength > LARGE_FILE_THRESHOLD
    const partSize = isLargeFile ? LARGE_FILE_PART_SIZE : MULTIPART_PART_SIZE
    const queueSize = isLargeFile ? LARGE_FILE_QUEUE_SIZE : 4

    console.log(
      `[R2 Service] Large file detected (${(contentLength / 1024 / 1024 / 1024).toFixed(1)}GB), using optimized settings: ${partSize / 1024 / 1024}MB parts, ${queueSize} concurrent uploads`
    )

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucket,
        Key: key,
        Body: multipartStream,
        ContentType: contentType
      },
      queueSize,
      partSize,
      // Don't leave parts on error - clean up failed uploads
      leavePartsOnError: false
    })

    // Enhanced progress tracking for large files
    let lastLoggedPercent = 0
    let lastLoggedTime = Date.now()
    upload.on('httpUploadProgress', (progress) => {
      if (progress.loaded && progress.total) {
        const percent = Math.floor((progress.loaded / progress.total) * 100)
        const currentTime = Date.now()

        // For large files, log more frequently (every 10% instead of 25%)
        const logInterval = contentLength > LARGE_FILE_THRESHOLD ? 10 : 25

        if (
          percent >= lastLoggedPercent + logInterval ||
          currentTime - lastLoggedTime > 30000
        ) {
          // Also log every 30 seconds
          const uploadedGB = (progress.loaded / 1024 / 1024 / 1024).toFixed(2)
          const totalGB = (progress.total / 1024 / 1024 / 1024).toFixed(2)
          console.log(
            `[R2 Service] Upload progress: ${percent}% (${uploadedGB}GB / ${totalGB}GB)`
          )
          lastLoggedPercent = percent
          lastLoggedTime = currentTime
        }
      }
    })

    try {
      await upload.done()
      console.log('[R2 Service] Multipart upload completed successfully')
    } catch (err) {
      console.error('[R2 Service] Multipart upload failed:', err)
      throw err
    }
  })
}

/**
 * Directly uploads a file to R2 using the S3 PutObjectCommand (no presigned URL).
 * Suitable for small files such as audio previews. We use this for audio previews
 * because we don't want to create a new R2 asset for each audio preview. Since, they
 * are in api-languages not api-media.
 */
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
}): Promise<void> {
  return retryWithBackoff(async () => {
    const fileStream = createReadStream(filePath)
    try {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: fileStream,
          ContentType: contentType
        })
      )
      console.log(
        '[R2 Service] Successfully uploaded audio preview via PutObject.'
      )
    } catch (error) {
      console.error('[R2 Service] Direct upload failed:', error)
      throw error
    }
  })
}
