import { createReadStream } from 'fs'

import { S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import fetch from 'node-fetch'

import { CREATE_CLOUDFLARE_R2_ASSET } from './gql/mutations'
import { getGraphQLClient } from './graphqlClient'

const MULTIPART_THRESHOLD = 100 * 1024 * 1024 // 100MB
const MULTIPART_PART_SIZE = 10 * 1024 * 1024 // 10MB

if (!process.env.CLOUDFLARE_R2_ENDPOINT) {
  throw new Error('R2_ENDPOINT environment variable is required')
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
}) {
  const client = await getGraphQLClient()
  const safeContentLength = contentLength > 2_147_483_647 ? -1 : contentLength
  const data: { cloudflareR2Create: { uploadUrl: string; publicUrl: string } } =
    await client.request(CREATE_CLOUDFLARE_R2_ASSET, {
      input: {
        fileName,
        contentType,
        originalFilename,
        videoId,
        contentLength: safeContentLength
      }
    })
  return data.cloudflareR2Create
}

/**
 * Uploads a file to R2 using the best method for the file size.
 * For files <100MB, uses a single PUT to the pre-signed URL.
 * For files >=100MB, uses multipart upload via S3 API.
 * @param uploadUrl Pre-signed PUT URL (for small files)
 * @param bucket R2 bucket name (for multipart)
 * @param key R2 object key (for multipart)
 * @param filePath Local file path
 * @param contentType MIME type
 * @param contentLength File size in bytes
 */
export async function uploadToR2({
  uploadUrl,
  bucket,
  key,
  filePath,
  contentType,
  contentLength
}: {
  uploadUrl: string
  bucket: string
  key: string
  filePath: string
  contentType: string
  contentLength: number
}) {
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
