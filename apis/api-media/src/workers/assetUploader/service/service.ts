import path from 'path'

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Logger } from 'pino'
import { v4 as uuidv4 } from 'uuid'

import { prisma } from '../../../lib/prisma'

/**
 * Gets the S3 client for Cloudflare R2
 */
function getClient(): S3Client {
  if (process.env.CLOUDFLARE_R2_ENDPOINT == null)
    throw new Error('Missing CLOUDFLARE_R2_ENDPOINT')
  if (process.env.CLOUDFLARE_R2_ACCESS_KEY_ID == null)
    throw new Error('Missing CLOUDFLARE_R2_ACCESS_KEY_ID')
  if (process.env.CLOUDFLARE_R2_SECRET == null)
    throw new Error('Missing CLOUDFLARE_R2_SECRET')

  return new S3Client({
    region: 'auto',
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET
    }
  })
}

/**
 * Uploads a file to Cloudflare R2 from a URL
 */
async function uploadToR2FromUrl(
  url: string,
  fileName: string,
  contentType: string,
  logger?: Logger
): Promise<string> {
  if (process.env.CLOUDFLARE_R2_BUCKET == null)
    throw new Error('Missing CLOUDFLARE_R2_BUCKET')
  if (process.env.CLOUDFLARE_R2_CUSTOM_DOMAIN == null)
    throw new Error('Missing CLOUDFLARE_R2_CUSTOM_DOMAIN')

  logger?.info(`Downloading file from ${url}`)
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(
      `Failed to download file from ${url}: ${response.statusText}`
    )
  }

  const fileBuffer = await response.arrayBuffer()

  logger?.info(`Uploading file to R2: ${fileName}`)

  const client = getClient()
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET,
      Key: fileName,
      Body: Buffer.from(fileBuffer),
      ContentType: contentType
    })
  )

  const publicUrl = `${process.env.CLOUDFLARE_R2_CUSTOM_DOMAIN}/${fileName}`
  logger?.info(`File uploaded to R2: ${publicUrl}`)

  return publicUrl
}

/**
 * Main service function that processes videoVariantDownloads without assets
 */
export async function service(logger?: Logger): Promise<void> {
  logger?.info('Starting assetUploader service')

  // Find all videoVariantDownloads without an associated asset
  const downloadsWithoutAssets = await prisma.videoVariantDownload.findMany({
    where: {
      assetId: null,
      url: { not: '' }
    },
    include: {
      videoVariant: {
        select: {
          id: true,
          videoId: true
        }
      }
    }
  })

  logger?.info(
    `Found ${downloadsWithoutAssets.length} downloads without assets`
  )

  for (const download of downloadsWithoutAssets) {
    try {
      // Generate a unique filename
      const fileExtension =
        path.extname(new URL(download.url).pathname) || '.mp4'
      const fileName = `video-download-${uuidv4()}${fileExtension}`

      // Get the content type based on the file extension
      const contentType =
        fileExtension === '.mp4' ? 'video/mp4' : 'application/octet-stream'

      // Get the video ID from the variant or use a placeholder
      const videoId = download.videoVariant?.videoId || undefined

      // Create a new CloudflareR2 asset
      const asset = await prisma.cloudflareR2.create({
        data: {
          fileName,
          userId: 'system', // Using 'system' as the user ID for automated uploads
          contentType,
          contentLength: download.size ? Math.floor(download.size) : 0,
          videoId
        }
      })

      logger?.info(`Created CloudflareR2 asset: ${asset.id}`)

      // Upload the file to R2
      const publicUrl = await uploadToR2FromUrl(
        download.url,
        fileName,
        contentType,
        logger
      )

      // Update the asset with the public URL
      await prisma.cloudflareR2.update({
        where: { id: asset.id },
        data: { publicUrl }
      })

      // Update the videoVariantDownload with the new asset ID and URL
      await prisma.videoVariantDownload.update({
        where: { id: download.id },
        data: {
          assetId: asset.id,
          url: publicUrl
        }
      })

      logger?.info(`Successfully processed download: ${download.id}`)
    } catch (error) {
      logger?.error(
        { error, downloadId: download.id },
        `Error processing download: ${download.id}`
      )
    }
  }

  logger?.info('Completed assetUploader service')
}
