import { createReadStream } from 'fs'

import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'

import { getGraphQLClient } from '../gql/graphqlClient'
import { CREATE_CLOUDFLARE_R2_ASSET } from '../gql/mutations'
import { R2Asset } from '../types'

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

  await uploadViaMultipart(bucket, key, filePath, contentType)
  console.log('[R2 Service] Multipart upload completed')

  // Verify the uploaded file is retrievable
  await verifyFileUpload(bucket, key, contentLength)
  console.log('[R2 Service] File verification completed')
}

async function uploadViaMultipart(
  bucket: string,
  key: string,
  filePath: string,
  contentType: string
): Promise<void> {
  console.log('[R2 Service] Starting multipart upload...')

  const fileStream = createReadStream(filePath, {
    highWaterMark: 5 * 1024 * 1024, // 5MB chunks
    autoClose: true
  })

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: bucket,
      Key: key,
      Body: fileStream,
      ContentType: contentType
    },
    queueSize: 2,
    partSize: 20 * 1024 * 1024, // 20MB parts
    leavePartsOnError: false
  })

  let lastPercent = 0
  let lastLogTime = Date.now()

  upload.on('httpUploadProgress', (progress) => {
    if (progress.loaded && progress.total) {
      const percent = Math.floor((progress.loaded / progress.total) * 100)
      const now = Date.now()

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

  await upload.done()
}

async function verifyFileUpload(
  bucket: string,
  key: string,
  expectedContentLength: number
): Promise<void> {
  console.log('[R2 Service] Verifying uploaded file...')

  try {
    const headObjectCommand = new HeadObjectCommand({
      Bucket: bucket,
      Key: key
    })

    const response = await s3Client.send(headObjectCommand)

    if (!response.ContentLength) {
      throw new Error('File verification failed: No content length returned')
    }

    if (response.ContentLength !== expectedContentLength) {
      throw new Error(
        `File verification failed: Expected ${expectedContentLength} bytes, got ${response.ContentLength} bytes`
      )
    }

    console.log(
      `[R2 Service] File verification successful: ${response.ContentLength} bytes`
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
  const fileStream = createReadStream(filePath)
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: fileStream,
      ContentType: contentType
    })
  )

  console.log(`[R2 Service] Direct upload completed: ${key}`)

  if (!process.env.CLOUDFLARE_R2_ENDPOINT) {
    throw new Error(
      'CLOUDFLARE_R2_ENDPOINT is required for public URL generation'
    )
  }

  const publicBaseUrl = `https://${bucket}.${new URL(process.env.CLOUDFLARE_R2_ENDPOINT).hostname}`

  return `${publicBaseUrl.replace(/\/$/, '')}/${key}`
}
