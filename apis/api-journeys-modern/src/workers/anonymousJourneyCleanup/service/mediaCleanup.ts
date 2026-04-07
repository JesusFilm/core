import 'cloudflare/shims/node'

import Mux from '@mux/mux-node'
import Cloudflare from 'cloudflare'
import fetch from 'node-fetch'
import { Logger } from 'pino'

import { VideoBlockSource, prisma } from '@core/prisma/journeys/client'
import { prisma as prismaMedia } from '@core/prisma/media/client'

export interface MediaReferences {
  muxVideoIds: Set<string>
  cloudflareImageIds: Set<string>
}

const CLOUDFLARE_IMAGE_URL_PATTERN = /imagedelivery\.net\/[^/]+\/([^/]+)/

export function extractCloudflareImageId(src: string): string | null {
  return src.match(CLOUDFLARE_IMAGE_URL_PATTERN)?.[1] ?? null
}

export async function collectMediaFromJourneys(
  journeyIds: string[]
): Promise<MediaReferences> {
  const blocks = await prisma.block.findMany({
    where: { journeyId: { in: journeyIds } },
    select: { videoId: true, source: true, src: true }
  })

  const muxVideoIds = new Set<string>()
  const cloudflareImageIds = new Set<string>()

  for (const block of blocks) {
    if (block.source === VideoBlockSource.mux && block.videoId != null) {
      muxVideoIds.add(block.videoId)
    }

    if (block.src != null) {
      const imageId = extractCloudflareImageId(block.src)
      if (imageId != null) {
        cloudflareImageIds.add(imageId)
      }
    }
  }

  return { muxVideoIds, cloudflareImageIds }
}

async function isMuxVideoUsedElsewhere(
  videoId: string,
  excludeJourneyIds: string[]
): Promise<boolean> {
  const count = await prisma.block.count({
    where: {
      source: VideoBlockSource.mux,
      videoId,
      journeyId: { notIn: excludeJourneyIds },
      deletedAt: null
    }
  })
  return count > 0
}

async function isCloudflareImageUsedElsewhere(
  imageId: string,
  excludeJourneyIds: string[]
): Promise<boolean> {
  const count = await prisma.block.count({
    where: {
      src: { contains: imageId },
      journeyId: { notIn: excludeJourneyIds },
      deletedAt: null
    }
  })
  return count > 0
}

function getMuxClient(): Mux | null {
  const tokenId = process.env.MUX_UGC_ACCESS_TOKEN_ID
  const tokenSecret = process.env.MUX_UGC_SECRET_KEY
  if (tokenId == null || tokenSecret == null) return null
  return new Mux({ tokenId, tokenSecret })
}

function getCloudflareClient(): { client: Cloudflare; accountId: string } | null {
  const apiToken = process.env.CLOUDFLARE_IMAGES_TOKEN
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  if (apiToken == null || accountId == null) return null
  return { client: new Cloudflare({ apiToken, fetch }), accountId }
}

export async function deleteMuxAsset(assetId: string): Promise<void> {
  const mux = getMuxClient()
  if (mux == null) return
  await mux.video.assets.delete(assetId)
}

export async function deleteCloudflareImageAsset(
  imageId: string
): Promise<void> {
  const cf = getCloudflareClient()
  if (cf == null) return
  await cf.client.images.v1.delete(imageId, { account_id: cf.accountId })
}

export async function deleteUnusedMedia(
  refs: MediaReferences,
  journeyIds: string[],
  userId: string,
  logger?: Logger
): Promise<{ deletedMuxVideos: number; deletedCloudflareImages: number }> {
  let deletedMuxVideos = 0
  let deletedCloudflareImages = 0

  for (const videoId of refs.muxVideoIds) {
    try {
      if (await isMuxVideoUsedElsewhere(videoId, journeyIds)) {
        logger?.debug({ videoId }, 'Mux video used elsewhere, skipping')
        continue
      }

      const muxVideo = await prismaMedia.muxVideo.findUnique({
        where: { id: videoId },
        select: { assetId: true, userId: true }
      })

      if (muxVideo == null) {
        logger?.debug({ videoId }, 'MuxVideo record not found in media DB')
        continue
      }

      if (muxVideo.userId !== userId) {
        logger?.debug(
          { videoId },
          'MuxVideo belongs to a different user, skipping'
        )
        continue
      }

      if (muxVideo.assetId != null) {
        await deleteMuxAsset(muxVideo.assetId)
      }

      await prismaMedia.muxVideo.delete({ where: { id: videoId } })
      deletedMuxVideos++
      logger?.info({ videoId }, 'Deleted unused Mux video')
    } catch (error) {
      logger?.warn({ videoId, error }, 'Failed to delete Mux video')
    }
  }

  for (const imageId of refs.cloudflareImageIds) {
    try {
      if (await isCloudflareImageUsedElsewhere(imageId, journeyIds)) {
        logger?.debug(
          { imageId },
          'Cloudflare image used elsewhere, skipping'
        )
        continue
      }

      const cfImage = await prismaMedia.cloudflareImage.findUnique({
        where: { id: imageId },
        select: { userId: true }
      })

      if (cfImage == null) {
        logger?.debug(
          { imageId },
          'CloudflareImage record not found in media DB'
        )
        continue
      }

      if (cfImage.userId !== userId) {
        logger?.debug(
          { imageId },
          'CloudflareImage belongs to a different user, skipping'
        )
        continue
      }

      await deleteCloudflareImageAsset(imageId)
      await prismaMedia.cloudflareImage.delete({ where: { id: imageId } })
      deletedCloudflareImages++
      logger?.info({ imageId }, 'Deleted unused Cloudflare image')
    } catch (error) {
      logger?.warn({ imageId, error }, 'Failed to delete Cloudflare image')
    }
  }

  return { deletedMuxVideos, deletedCloudflareImages }
}
