import { createReadStream } from 'fs'

import {
  HeadObjectCommand,
  ListObjectsCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import fetch from 'node-fetch'

import { getGraphQLClient } from '../gql/graphqlClient'
import { CREATE_CLOUDFLARE_R2_ASSET } from '../gql/mutations'
import { R2Asset } from '../types'

const MULTIPART_THRESHOLD = 100 * 1024 * 1024 // 100MB
const MAX_RETRIES = 3
const RETRY_DELAY = 2000

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

// Simple retry wrapper
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = MAX_RETRIES
): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt === maxRetries) {
        throw lastError
      }

      const delay = RETRY_DELAY * Math.pow(2, attempt - 1)
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`)
      await new Promise((resolve) => setTimeout(resolve, delay))
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

// Verify upload by checking object exists and has correct size
async function verifyR2Upload(
  bucket: string,
  key: string,
  expectedSize: number
): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({ Bucket: bucket, Key: key })
    const response = await s3Client.send(command)

    const actualSize = response.ContentLength || 0
    if (actualSize === expectedSize) {
      console.log(`Upload verified: ${actualSize} bytes`)
      return true
    } else {
      console.error(
        `Size mismatch: expected ${expectedSize}, got ${actualSize}`
      )
      return false
    }
  } catch (error) {
    console.error('Upload verification failed:', error)
    return false
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
  // Extract key from uploadUrl
  const url = new URL(uploadUrl)
  const key = url.pathname.substring(1)

  console.log(
    `Uploading ${(contentLength / 1024 / 1024).toFixed(1)}MB to R2...`
  )

  if (contentLength < MULTIPART_THRESHOLD) {
    // Single PUT for small files
    return withRetry(async () => {
      const fileStream = createReadStream(filePath)

      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
          'Content-Length': contentLength.toString()
        },
        body: fileStream as any
      })

      if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(
          `Upload failed: ${response.status} ${response.statusText} - ${errorBody}`
        )
      }

      // Verify upload
      const verified = await verifyR2Upload(bucket, key, contentLength)
      if (!verified) {
        throw new Error('Upload verification failed')
      }

      console.log('Single upload completed and verified')
    })
  }

  // Multipart upload for large files
  return withRetry(async () => {
    const fileStream = createReadStream(filePath)

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucket,
        Key: key,
        Body: fileStream,
        ContentType: contentType
      },
      queueSize: 4,
      partSize: 10 * 1024 * 1024, // 10MB parts
      leavePartsOnError: false
    })

    // Simple progress logging
    let lastPercent = 0
    upload.on('httpUploadProgress', (progress) => {
      if (progress.loaded && progress.total) {
        const percent = Math.floor((progress.loaded / progress.total) * 100)
        if (percent >= lastPercent + 25) {
          console.log(`Upload progress: ${percent}%`)
          lastPercent = percent
        }
      }
    })

    await upload.done()

    // Verify upload
    const verified = await verifyR2Upload(bucket, key, contentLength)
    if (!verified) {
      throw new Error('Multipart upload verification failed')
    }

    console.log('Multipart upload completed and verified')
  })
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
  return withRetry(async () => {
    const fileStream = createReadStream(filePath)
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: fileStream,
        ContentType: contentType
      })
    )

    console.log('Direct upload completed')

    // Construct and return the public URL
    if (!process.env.CLOUDFLARE_R2_ENDPOINT) {
      throw new Error(
        'CLOUDFLARE_R2_ENDPOINT is required for public URL generation'
      )
    }

    const publicBaseUrl = `https://${bucket}.${new URL(process.env.CLOUDFLARE_R2_ENDPOINT).hostname}`

    return `${publicBaseUrl.replace(/\/$/, '')}/${key}`
  })
}

export async function r2ConnectionTest() {
  console.log('Testing R2 connection...')

  if (!process.env.CLOUDFLARE_R2_BUCKET) {
    throw new Error('CLOUDFLARE_R2_BUCKET environment variable is required')
  }

  const command = new ListObjectsCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET
  })

  try {
    const response = await s3Client.send(command)
    console.log('R2 connection test successful')
    console.log(`Found ${response.Contents?.length || 0} objects in bucket`)
    return true
  } catch (error) {
    console.error('R2 connection test failed:', error)
    throw error
  }
}
