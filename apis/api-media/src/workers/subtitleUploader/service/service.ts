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
  logger?.info('Starting subtitleUploader service')

  // Find VideoSubtitles with srtSrc or vttSrc URLs but without corresponding assets
  const subtitlesWithoutAssets = await prisma.videoSubtitle.findMany({
    where: {
      OR: [
        {
          srtSrc: { not: null },
          srtAssetId: null
        },
        {
          vttSrc: { not: null },
          vttAssetId: null
        }
      ]
    },
    include: {
      video: {
        select: {
          id: true
        }
      }
    }
  })

  logger?.info(
    `Found ${subtitlesWithoutAssets.length} subtitles without assets`
  )

  for (const subtitle of subtitlesWithoutAssets) {
    const videoId = subtitle.videoId
    const editionId = subtitle.edition

    try {
      // Process SRT file if it exists
      if (subtitle.srtSrc && !subtitle.srtAssetId) {
        const fileExtension =
          path.extname(new URL(subtitle.srtSrc).pathname) || '.srt'
        const fileName = `${videoId}/editions/${editionId}/subtitles/${videoId}_${editionId}_${subtitle.languageId}${fileExtension}`
        const contentType = 'text/plain'

        const asset = await prisma.cloudflareR2.create({
          data: {
            fileName,
            userId: 'system',
            contentType,
            contentLength: 0, // Will be updated after upload
            videoId
          }
        })

        logger?.info(`Created CloudflareR2 asset for SRT: ${asset.id}`)

        const publicUrl = await uploadToR2FromUrl(
          subtitle.srtSrc,
          fileName,
          contentType,
          logger
        )

        await prisma.cloudflareR2.update({
          where: { id: asset.id },
          data: { publicUrl }
        })

        await prisma.videoSubtitle.update({
          where: { id: subtitle.id },
          data: {
            srtAssetId: asset.id,
            srtSrc: publicUrl,
            srtVersion: subtitle.srtVersion + 1
          }
        })

        logger?.info(`Successfully processed SRT subtitle: ${subtitle.id}`)
      }

      // Process VTT file if it exists
      if (subtitle.vttSrc && !subtitle.vttAssetId) {
        const fileExtension =
          path.extname(new URL(subtitle.vttSrc).pathname) || '.vtt'
        const fileName = `${videoId}/editions/${editionId}/subtitles/${videoId}_${editionId}_${subtitle.languageId}${fileExtension}`
        const contentType = 'text/vtt'

        const asset = await prisma.cloudflareR2.create({
          data: {
            fileName,
            userId: 'system',
            contentType,
            contentLength: 0, // Will be updated after upload
            videoId
          }
        })

        logger?.info(`Created CloudflareR2 asset for VTT: ${asset.id}`)

        const publicUrl = await uploadToR2FromUrl(
          subtitle.vttSrc,
          fileName,
          contentType,
          logger
        )

        await prisma.cloudflareR2.update({
          where: { id: asset.id },
          data: { publicUrl }
        })

        await prisma.videoSubtitle.update({
          where: { id: subtitle.id },
          data: {
            vttAssetId: asset.id,
            vttSrc: publicUrl,
            vttVersion: subtitle.vttVersion + 1
          }
        })

        logger?.info(`Successfully processed VTT subtitle: ${subtitle.id}`)
      }
    } catch (error) {
      logger?.error(
        { error, subtitleId: subtitle.id },
        `Error processing subtitle: ${subtitle.id}`
      )
    }
  }

  logger?.info('Completed subtitleUploader service')
}
