import path from 'path'

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Logger } from 'pino'

import { prisma } from '../lib/prisma'
import { logger } from '../logger'

function getR2Client(): S3Client {
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

async function uploadToR2FromUrl(
  url: string,
  fileName: string,
  contentType: string,
  expectedSize?: number,
  logger?: Logger
): Promise<{ publicUrl: string; actualSize: number }> {
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
  const actualSize = fileBuffer.byteLength

  // Validate file size if expected size is provided and > 0
  if (expectedSize != null && expectedSize > 0) {
    const sizeDifference = Math.abs(actualSize - expectedSize)
    const sizeTolerancePercent = 0.05 // 5% tolerance
    const maxToleranceBytes = expectedSize * sizeTolerancePercent

    if (sizeDifference > maxToleranceBytes) {
      logger?.warn(
        {
          expectedSize,
          actualSize,
          sizeDifference,
          fileName
        },
        'Downloaded file size differs significantly from expected size'
      )
    } else {
      logger?.info(
        {
          expectedSize,
          actualSize,
          fileName
        },
        'Downloaded file size matches expected size within tolerance'
      )
    }
  }

  // Validate that the file is not empty
  if (actualSize === 0) {
    throw new Error(`Downloaded file is empty: ${fileName}`)
  }

  logger?.info(`Uploading file to R2: ${fileName} (${actualSize} bytes)`)

  const client = getR2Client()
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

  return { publicUrl, actualSize }
}

async function migrateDownloadsToR2(logger?: Logger): Promise<void> {
  logger?.info('Starting download migration to R2')

  const downloadsWithoutAssets = await prisma.videoVariantDownload.findMany({
    where: {
      assetId: null,
      url: { not: '' }
    },
    include: {
      videoVariant: {
        select: {
          id: true,
          languageId: true,
          videoId: true
        }
      }
    }
  })

  logger?.info(
    `Found ${downloadsWithoutAssets.length} downloads without assets`
  )

  for (const download of downloadsWithoutAssets) {
    if (download.videoVariant == null) {
      logger?.error(
        { downloadId: download.id },
        'Download has no associated video variant'
      )
      continue
    }

    const videoId = download.videoVariant.videoId

    try {
      const fileExtension =
        path.extname(new URL(download.url).pathname) || '.mp4'
      const fileName = `${videoId}/variants/${download.videoVariant.languageId}/downloads/${download.videoVariant.id}_${download.quality}${fileExtension}`

      const contentType =
        fileExtension === '.mp4' ? 'video/mp4' : 'application/octet-stream'

      const expectedSize =
        download.size && download.size > 0 ? download.size : undefined

      const asset = await prisma.cloudflareR2.create({
        data: {
          fileName,
          userId: 'system',
          contentType,
          contentLength: expectedSize ? Math.floor(expectedSize) : 0,
          videoId
        }
      })

      logger?.info(`Created CloudflareR2 asset: ${asset.id}`)

      const { publicUrl, actualSize } = await uploadToR2FromUrl(
        download.url,
        fileName,
        contentType,
        expectedSize,
        logger
      )

      // Update the asset with the actual size and public URL
      await prisma.cloudflareR2.update({
        where: { id: asset.id },
        data: {
          publicUrl,
          contentLength: actualSize
        }
      })

      // Update the download with the actual size if it was 0 or null
      const updateData: { assetId: string; url: string; size?: number } = {
        assetId: asset.id,
        url: publicUrl
      }

      if (expectedSize == null || expectedSize === 0) {
        updateData.size = actualSize
        logger?.info(
          { downloadId: download.id, actualSize },
          'Updated download size with actual file size'
        )
      }

      await prisma.videoVariantDownload.update({
        where: { id: download.id },
        data: updateData
      })

      logger?.info(`Successfully processed download: ${download.id}`)
    } catch (error) {
      logger?.error(
        { error, downloadId: download.id },
        `Error processing download: ${download.id}`
      )
    }
  }

  logger?.info('Completed download migration to R2')
}

async function main(): Promise<void> {
  const scriptLogger = logger.child({ script: 'download-migrate-r2' })

  try {
    scriptLogger.info('Starting download-migrate-r2 script')
    await migrateDownloadsToR2(scriptLogger)
    scriptLogger.info('Download-migrate-r2 script completed successfully')
  } catch (error) {
    scriptLogger.error({ error }, 'Download-migrate-r2 script failed')
    process.exit(1)
  }
}

if (require.main === module) {
  void main()
}

export { main, migrateDownloadsToR2 }
