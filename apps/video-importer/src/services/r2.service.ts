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
  contentLength: string
}): Promise<R2Asset> {
  const client = await getGraphQLClient()
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
  return data.cloudflareR2Create
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
  contentLength: string // string to support large files
}) {
  // Extract the key from the uploadUrl for multipart uploads
  const url = new URL(uploadUrl)
  const key = url.pathname.substring(1) // Remove leading slash
  if (contentLength < MULTIPART_THRESHOLD) {
    // Single PUT for small files
    console.log('[R2 Service] Using single PUT upload.')
    const fileStream = createReadStream(filePath)
    let bytesSent = 0
    let lastLoggedPercent = 0
    fileStream.on('data', (chunk) => {
      bytesSent += chunk.length
      const percent = Math.floor((bytesSent / contentLength) * 100)
      if (percent >= lastLoggedPercent + 25) {
        console.log(
          `     [R2 Service] Upload progress: ${percent}% (${bytesSent}/${contentLength} bytes)`
        )
        lastLoggedPercent = percent
      }
    })
    fileStream.on('error', (err) => {
      throw new Error(`Failed to read file stream: ${err.message}`)
    })
    console.log('[R2 Service] Sending PUT request to R2...')
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
      console.error('[R2 Service] Upload failed!')
      console.error(`  Status: ${response.status} ${response.statusText}`)
      console.error(
        '  Headers:',
        JSON.stringify([...response.headers], null, 2)
      )
      console.error('  Body:', errorBody)
      throw new Error(
        `Failed to upload to R2. Status: ${response.status} ${response.statusText}. Body: ${errorBody}`
      )
    }
    console.log('     [R2 Service] Successfully uploaded.')
    return
  }

  // Multipart upload for large files
  console.log('[R2 Service] Using multipart upload for large file.')
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
  upload.on('httpUploadProgress', (progress) => {
    if (progress.loaded && progress.total) {
      const percent = Math.floor((progress.loaded / progress.total) * 100)
      console.log(`[R2 Service] Multipart upload progress: ${percent}%`)
    }
  })
  try {
    await upload.done()
    console.log('[R2 Service] Multipart upload complete.')
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
