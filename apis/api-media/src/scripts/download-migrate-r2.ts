import path from 'path'

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

import {
  PrismaClient,
  VideoVariantDownloadQuality
} from '.prisma/api-media-client'

const prisma = new PrismaClient()

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
  expectedSize?: number
): Promise<{ publicUrl: string; actualSize: number }> {
  if (process.env.CLOUDFLARE_R2_BUCKET == null)
    throw new Error('Missing CLOUDFLARE_R2_BUCKET')
  if (process.env.CLOUDFLARE_R2_CUSTOM_DOMAIN == null)
    throw new Error('Missing CLOUDFLARE_R2_CUSTOM_DOMAIN')

  console.info(`Downloading file from ${url}`)
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
      console.warn(
        {
          expectedSize,
          actualSize,
          sizeDifference,
          fileName
        },
        'Downloaded file size differs significantly from expected size'
      )
    } else {
      console.info(
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

  console.info(`Uploading file to R2: ${fileName} (${actualSize} bytes)`)

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
  console.info(`File uploaded to R2: ${publicUrl}`)

  return { publicUrl, actualSize }
}

async function migrateDownloadsToR2(): Promise<void> {
  console.info('Starting download migration to R2')

  for (const quality of [
    VideoVariantDownloadQuality.high,
    VideoVariantDownloadQuality.distroHigh,
    VideoVariantDownloadQuality.sd,
    VideoVariantDownloadQuality.distroSd,
    VideoVariantDownloadQuality.low,
    VideoVariantDownloadQuality.distroLow
  ]) {
    const where = {
      where: {
        videoVariantId: '13_9774-0-RPGospelIntro',
        assetId: null,
        AND: [
          { url: { not: '' } },
          { url: { not: { startsWith: 'https://stream' } } }
        ],
        quality
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
    }
    let download = await prisma.videoVariantDownload.findFirst(where)
    while (download != null) {
      console.info(
        `Processing download: ${download.videoVariantId} - ${download.quality}`
      )
      try {
        // Skip any downloads missing a videoVariant
        if (!download.videoVariant) {
          console.error(
            { downloadId: download.id },
            'VideoVariant is null for download'
          )
          continue
        }

        const videoId = download.videoVariant?.videoId
        const fileExtension =
          path.extname(new URL(download.url).pathname) || '.mp4'
        const fileName =
          `${videoId}/variants/${download.videoVariant.languageId}` +
          `/downloads/${download.videoVariant.id}_${download.quality}${fileExtension}`

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

        console.info(`Created CloudflareR2 asset: ${asset.id}`)

        const { publicUrl, actualSize } = await uploadToR2FromUrl(
          download.url,
          fileName,
          contentType,
          expectedSize
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
          console.info(
            { downloadId: download.id, actualSize },
            'Updated download size with actual file size'
          )
        }

        // Update all downloads with the same URL to use the new asset
        await prisma.videoVariantDownload.updateMany({
          where: { url: download.url },
          data: updateData
        })

        if (quality === VideoVariantDownloadQuality.high) {
          await prisma.videoVariantDownload.updateMany({
            where: {
              videoVariantId: download.videoVariantId,
              quality: VideoVariantDownloadQuality.distroHigh
            },
            data: updateData
          })
        }

        if (quality === VideoVariantDownloadQuality.sd) {
          await prisma.videoVariantDownload.updateMany({
            where: {
              videoVariantId: download.videoVariantId,
              quality: VideoVariantDownloadQuality.distroSd
            },
            data: updateData
          })
        }

        if (quality === VideoVariantDownloadQuality.low) {
          await prisma.videoVariantDownload.updateMany({
            where: {
              videoVariantId: download.videoVariantId,
              quality: VideoVariantDownloadQuality.distroLow
            },
            data: updateData
          })
        }

        console.info('Successfully processed download')
      } catch (error) {
        console.error(
          { error, downloadId: download.id },
          `Error processing download: ${download.id}`
        )
        download = await prisma.videoVariantDownload.findFirst(where)
      }
      download = await prisma.videoVariantDownload.findFirst(where)
    }
  }

  console.info('Completed download migration to R2')
}

async function main(): Promise<void> {
  try {
    console.info('Starting download-migrate-r2 script')
    await migrateDownloadsToR2()
    console.info('Download-migrate-r2 script completed successfully')
  } catch (error) {
    console.error({ error }, 'Download-migrate-r2 script failed')
    process.exit(1)
  }
}

if (require.main === module) {
  void main()
}

export { main, migrateDownloadsToR2 }
