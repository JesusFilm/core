import { createReadStream } from 'fs'

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import fetch from 'node-fetch'

import type { R2Asset } from '../types'

import { CREATE_CLOUDFLARE_R2_ASSET } from './gql/mutations'
import { getGraphQLClient } from './graphqlClient'

const MULTIPART_THRESHOLD = 100 * 1024 * 1024 // 100MB
const MULTIPART_PART_SIZE = 10 * 1024 * 1024 // 10MB

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

    const fileStream = createReadStream(filePath)
    fileStream.on('error', (err) => {
      throw new Error(`Failed to read file stream: ${err.message}`)
    })

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
    return
  }

  // Multipart upload for large files
  console.log(
    `[R2 Service] Uploading ${(contentLength / 1024 / 1024).toFixed(1)}MB via multipart upload`
  )

  const multipartStream = createReadStream(filePath)
  multipartStream.on('error', (err) => {
    throw new Error(
      `Failed to read file stream for multipart upload: ${err.message}`
    )
  })

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: bucket,
      Key: key,
      Body: multipartStream,
      ContentType: contentType
    },
    queueSize: 4,
    partSize: MULTIPART_PART_SIZE
  })

  // Only log significant progress milestones (25%, 50%, 75%, 100%)
  let lastLoggedPercent = 0
  upload.on('httpUploadProgress', (progress) => {
    if (progress.loaded && progress.total) {
      const percent = Math.floor((progress.loaded / progress.total) * 100)
      if (percent >= lastLoggedPercent + 25) {
        console.log(`[R2 Service] Upload progress: ${percent}%`)
        lastLoggedPercent = percent
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
}
