import { Logger } from 'pino'
import { z } from 'zod'

import { prisma } from '@core/prisma-media/client'

import { parse, parseMany, processTable } from '../../importer'
import { getVideoVariantIds } from '../videoVariants'

const s3Schema = z.object({
  videoVariantId: z.string(),
  masterUri: z.string(),
  height: z.number(),
  width: z.number()
})

export async function importMasterUrls(logger?: Logger): Promise<void> {
  await processTable(
    'jfp-data-warehouse.jfp_mmdb_prod.core_videoVariantMaster_arclight_data',
    importOne,
    importMany,
    true,
    logger
  )
}

export async function importOne(row: unknown): Promise<void> {
  const video = parse(s3Schema, row)
  if (!getVideoVariantIds().includes(video.videoVariantId))
    throw new Error(`VideoVariant with id ${video.videoVariantId} not found`)

  await prisma.videoVariant.update({
    where: {
      id: video.videoVariantId
    },
    data: {
      masterUrl: video.masterUri,
      masterWidth: video.width,
      masterHeight: video.height
    }
  })
}

export async function importMany(rows: unknown[]): Promise<void> {
  const { data: videos, inValidRowIds } = parseMany(s3Schema, rows)
  const videosWithVariants = videos.filter(({ videoVariantId }) =>
    getVideoVariantIds().includes(videoVariantId)
  )
  await prisma.$transaction(
    videosWithVariants.map((video) =>
      prisma.videoVariant.update({
        where: {
          id: video.videoVariantId
        },
        data: {
          masterUrl: video.masterUri,
          masterWidth: video.width,
          masterHeight: video.height
        }
      })
    )
  )
  if (videos.length !== rows.length)
    throw new Error(`some rows do not match schema: ${inValidRowIds.join(',')}`)
}
