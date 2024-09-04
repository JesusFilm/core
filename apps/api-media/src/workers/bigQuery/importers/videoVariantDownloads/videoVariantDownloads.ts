import omit from 'lodash/omit'
import { Logger } from 'pino'
import { z } from 'zod'

import { VideoVariantDownloadQuality } from '.prisma/api-media-client'

import { prisma } from '../../../../lib/prisma'
import { parse, parseMany, processTable } from '../../importer'
import { getVideoVariantIds } from '../videoVariants'

const videoVariantDownloadSchema = z
  .object({
    quality: z.nativeEnum(VideoVariantDownloadQuality),
    size: z.number(),
    uri: z.string(),
    videoVariantId: z.string()
  })
  .transform((data) => ({
    ...omit(data, 'uri'),
    url: data.uri
  }))

export async function importVideoVariantDownloads(
  logger?: Logger
): Promise<void> {
  await processTable(
    'jfp-data-warehouse.jfp_mmdb_prod.core_videoVariantDownload_arclight_data',
    importOne,
    importMany,
    true,
    logger
  )
}

export async function importOne(row: unknown): Promise<void> {
  const videoVariantDownload = parse(videoVariantDownloadSchema, row)
  if (!getVideoVariantIds().includes(videoVariantDownload.videoVariantId))
    throw new Error(
      `VideoVariant with id ${videoVariantDownload.videoVariantId} not found`
    )

  await prisma.videoVariantDownload.upsert({
    where: {
      quality_videoVariantId: {
        quality: videoVariantDownload.quality,
        videoVariantId: videoVariantDownload.videoVariantId
      }
    },
    update: videoVariantDownload,
    create: videoVariantDownload
  })
}

export async function importMany(rows: unknown[]): Promise<void> {
  const { data: videoVariantDownloads, inValidRowIds } = parseMany(
    videoVariantDownloadSchema,
    rows
  )

  if (videoVariantDownloads.length !== rows.length)
    throw new Error(`some rows do not match schema: ${inValidRowIds.join(',')}`)

  await prisma.videoVariantDownload.createMany({
    data: videoVariantDownloads.filter(({ videoVariantId }) =>
      getVideoVariantIds().includes(videoVariantId)
    ),
    skipDuplicates: true
  })
}
