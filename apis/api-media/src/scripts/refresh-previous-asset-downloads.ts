import { prisma } from '@core/prisma/media/client'

import {
  createDownloadsFromMuxAsset,
  downloadsReadyToStore,
  previewMuxDownloadsFromAsset
} from '../lib/downloads'
import { videoVariantCacheReset } from '../lib/videoCacheReset'
import { logger } from '../logger'
import { getVideo } from '../schema/mux/video/service'

import { hasFlag } from './cliFlags'

const MUX_REQUEST_DELAY_MS = 1500

export type PreviousAssetVariant = {
  variantId: string
  assetId: string
  playbackId: string
}

/**
 * Variants with at least one Mux download on a playback ID other than the
 * one they stream: files of the asset the variant had before a re-upload.
 */
export async function findVariantsWithPreviousAssetDownloads(): Promise<
  PreviousAssetVariant[]
> {
  // A column-to-column prefix comparison across three tables has no Prisma
  // query form, so this is the one raw read.
  return await prisma.$queryRaw<PreviousAssetVariant[]>`
    SELECT DISTINCT v."id" AS "variantId", m."assetId", m."playbackId"
    FROM "VideoVariantDownload" d
    JOIN "VideoVariant" v ON v."id" = d."videoVariantId"
    JOIN "MuxVideo" m ON m."id" = v."muxVideoId"
    WHERE m."assetId" IS NOT NULL
      AND m."playbackId" IS NOT NULL
      AND d."url" LIKE 'https://stream.mux.com/%'
      AND d."url" NOT LIKE 'https://stream.mux.com/' || m."playbackId" || '/%'
    ORDER BY v."id"
  `
}

export async function refreshPreviousAssetDownloads({
  apply,
  delayMs = MUX_REQUEST_DELAY_MS
}: {
  apply: boolean
  delayMs?: number
}): Promise<{ found: number; refreshed: number; skipped: number }> {
  const variants = await findVariantsWithPreviousAssetDownloads()
  logger.info(
    { apply, found: variants.length },
    `Previous-asset download refresh starting (${apply ? 'apply' : 'dry-run'} mode)`
  )

  let refreshed = 0
  let skipped = 0
  for (const { variantId, assetId, playbackId } of variants) {
    if (delayMs > 0)
      await new Promise((resolve) => setTimeout(resolve, delayMs))

    try {
      const muxVideoAsset = await getVideo(assetId, false)
      if (
        muxVideoAsset.status !== 'ready' ||
        muxVideoAsset.playback_ids?.[0]?.id !== playbackId ||
        !downloadsReadyToStore(muxVideoAsset)
      ) {
        logger.info(
          { variantId, assetId, status: muxVideoAsset.status },
          'Skipping variant: current Mux asset is not ready to store downloads'
        )
        skipped++
        continue
      }

      if (!apply) {
        logger.info(
          {
            variantId,
            playbackId,
            replacements: previewMuxDownloadsFromAsset({
              variantId,
              muxVideoAsset
            }).map(({ quality, url }) => ({ quality, url }))
          },
          'Dry run: would repoint downloads to the current Mux asset'
        )
        continue
      }

      const changed = await createDownloadsFromMuxAsset({
        variantId,
        muxVideoAsset,
        logger
      })
      if (changed > 0) {
        await videoVariantCacheReset(variantId)
        refreshed++
      }
    } catch (error) {
      logger.error(
        { error, variantId, assetId },
        'Failed to refresh previous-asset downloads'
      )
      skipped++
    }
  }

  const summary = { found: variants.length, refreshed, skipped }
  logger.info({ apply, ...summary }, 'Previous-asset download refresh finished')
  return summary
}

async function main(): Promise<void> {
  try {
    await refreshPreviousAssetDownloads({
      apply: hasFlag(process.argv, 'apply')
    })
  } catch (error) {
    logger.error({ error }, 'Previous-asset download refresh failed')
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  void main()
}
