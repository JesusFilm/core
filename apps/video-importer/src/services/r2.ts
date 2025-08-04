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
  const url = new URL(uploadUrl)
  const key = url.pathname.substring(1)

  console.log(
    `[R2 Service] Uploading ${(contentLength / 1024 / 1024).toFixed(1)}MB to R2...`
  )

  if (contentLength < MULTIPART_THRESHOLD) {
    // Single upload - keep your existing logic
    return withRetry(async () => {
      await uploadViaPUTBuffer(uploadUrl, filePath, contentType, contentLength)

      const verified = await verifyR2Upload(bucket, key, contentLength)
      if (!verified) {
        throw new Error('Upload verification failed')
      }

      console.log('[R2 Service] Single upload completed and verified')
    })
  }

  // Enhanced multipart upload
  return withRetry(async () => {
    await uploadViaMultipart(bucket, key, filePath, contentType, contentLength)

    // Verify upload
    const verified = await verifyR2Upload(bucket, key, contentLength)
    if (!verified) {
      throw new Error('Multipart upload verification failed')
    }

    console.log('[R2 Service] Multipart upload completed and verified')
  })
}

// Enhanced multipart upload for R2
async function uploadViaMultipart(
  bucket: string,
  key: string,
  filePath: string,
  contentType: string,
  contentLength: number
): Promise<void> {
  console.log('[R2 Service] Starting enhanced multipart upload...')

  // Pre-validate the file can handle multipart access
  try {
    await testMultipartFileAccess(filePath)
  } catch (error) {
    throw new Error(
      `File not suitable for multipart upload: ${error instanceof Error ? error.message : String(error)}`
    )
  }

  let upload: Upload | null = null
  let uploadAborted = false

  return new Promise((resolve, reject) => {
    // Create the file stream with optimal settings for multipart
    const fileStream = createReadStream(filePath, {
      highWaterMark: 5 * 1024 * 1024, // 5MB chunks - smaller for better reliability
      autoClose: true
    })

    // Track stream state
    let streamOpened = false
    let streamErrored = false

    fileStream.on('open', () => {
      console.log('[R2 Service] File stream opened for multipart upload')
      streamOpened = true
    })

    fileStream.on('error', (error) => {
      console.error(`[R2 Service] File stream error: ${error.message}`)
      streamErrored = true

      if (upload && !uploadAborted) {
        console.log('[R2 Service] Aborting upload due to stream error...')
        uploadAborted = true
        upload.abort().catch((abortError) => {
          console.error('[R2 Service] Upload abort failed:', abortError)
        })
      }

      if (!streamOpened) {
        reject(new Error(`File stream failed to open: ${error.message}`))
      }
    })

    // Only start upload after stream is ready
    fileStream.on('readable', () => {
      if (!upload && !streamErrored && !uploadAborted) {
        try {
          upload = new Upload({
            client: s3Client,
            params: {
              Bucket: bucket,
              Key: key,
              Body: fileStream,
              ContentType: contentType
            },
            // Conservative settings for Windows compatibility
            queueSize: 2, // Reduce concurrent parts for Windows
            partSize: 20 * 1024 * 1024, // Larger parts = fewer concurrent streams
            leavePartsOnError: false
          })

          // Progress tracking
          let lastPercent = 0
          let lastLogTime = Date.now()

          upload.on('httpUploadProgress', (progress) => {
            if (progress.loaded && progress.total) {
              const percent = Math.floor(
                (progress.loaded / progress.total) * 100
              )
              const now = Date.now()

              // Log every 10% or every 2 minutes
              if (percent >= lastPercent + 10 || now - lastLogTime > 120000) {
                const uploadedMB = (progress.loaded / 1024 / 1024).toFixed(1)
                const totalMB = (progress.total / 1024 / 1024).toFixed(1)
                console.log(
                  `[R2 Service] Upload progress: ${percent}% (${uploadedMB}/${totalMB} MB)`
                )
                lastPercent = percent
                lastLogTime = now
              }
            }
          })

          // Handle upload completion
          upload
            .done()
            .then(() => {
              console.log('[R2 Service] Multipart upload completed')
              resolve()
            })
            .catch((error) => {
              if (!uploadAborted) {
                console.error('[R2 Service] Multipart upload failed:', error)
                reject(new Error(`Multipart upload failed: ${error.message}`))
              }
            })
        } catch (error) {
          reject(
            new Error(
              `Failed to initialize multipart upload: ${error instanceof Error ? error.message : String(error)}`
            )
          )
        }
      }
    })

    // Overall timeout
    setTimeout(
      () => {
        if (!uploadAborted && upload) {
          console.error('[R2 Service] Multipart upload timed out')
          uploadAborted = true
          upload.abort().catch((abortError) => {
            console.error('[R2 Service] Upload abort failed:', abortError)
          })
          reject(new Error('Multipart upload timed out after 30 minutes'))
        }
      },
      30 * 60 * 1000
    ) // 30 minutes
  })
}

// Upload file via PUT request to pre-signed URL
async function uploadViaPUTBuffer(
  uploadUrl: string,
  filePath: string,
  contentType: string,
  contentLength: number
): Promise<void> {
  const fileStream = createReadStream(filePath)

  // Use AWS SDK for better reliability and consistency
  const url = new URL(uploadUrl)
  const key = url.pathname.substring(1)
  const bucket = url.hostname.split('.')[0] // Extract bucket from hostname

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: fileStream,
      ContentType: contentType
    })
  )
}

// Test if file can be accessed for multipart upload
async function testMultipartFileAccess(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const testStream = createReadStream(filePath, { highWaterMark: 1024 })

    testStream.on('open', () => {
      testStream.destroy()
      resolve()
    })

    testStream.on('error', (error) => {
      reject(new Error(`File access test failed: ${error.message}`))
    })
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
