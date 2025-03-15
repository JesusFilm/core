import path from 'path'

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Logger } from 'pino'

import { prisma } from '../../../lib/prisma'

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

export async function service(logger?: Logger): Promise<void> {
  logger?.info('Starting assetUploader service')

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

      const asset = await prisma.cloudflareR2.create({
        data: {
          fileName,
          userId: 'system',
          contentType,
          contentLength: download.size ? Math.floor(download.size) : 0,
          videoId
        }
      })

      logger?.info(`Created CloudflareR2 asset: ${asset.id}`)

      const publicUrl = await uploadToR2FromUrl(
        download.url,
        fileName,
        contentType,
        logger
      )

      await prisma.cloudflareR2.update({
        where: { id: asset.id },
        data: { publicUrl }
      })

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
