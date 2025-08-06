import { createReadStream } from 'fs'

import { ListObjectsCommand, S3Client } from '@aws-sdk/client-s3'
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

  // Progress tracking
  let lastPercent = 0
  let lastLogTime = Date.now()

  upload.on('httpUploadProgress', (progress) => {
    if (progress.loaded && progress.total) {
      const percent = Math.floor((progress.loaded / progress.total) * 100)
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

  await upload.done()
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
