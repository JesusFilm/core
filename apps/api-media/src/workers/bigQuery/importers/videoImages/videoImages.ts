import { Logger } from 'pino'
import { z } from 'zod'

import { ImageAspectRatio } from '.prisma/api-media-client'

import { prisma } from '../../../../lib/prisma'
import { parse, parseMany, processTable } from '../../importer'
import { getVideoIds } from '../videos'

const videoImageSchema = z
  .object({
    id: z.string(),
    aspectRatio: z.nativeEnum(ImageAspectRatio),
    videoId: z.string(),
    uploadUrl: z.string()
  })
  .transform((data) => ({
    ...data,
    userId: 'system'
  }))

export async function importVideoImages(logger?: Logger): Promise<void> {
  await processTable(
    'jfp-data-warehouse.jfp_mmdb_prod.core_cloudflare_image_data',
    importOne,
    importMany,
    true,
    logger
  )
}

export async function importOne(row: unknown): Promise<void> {
  const videoImage = parse(videoImageSchema, row)
  if (!getVideoIds().includes(videoImage.videoId))
    throw new Error(`Video with id ${videoImage.videoId} not found`)

  await prisma.cloudflareImage.upsert({
    where: {
      id: videoImage.id
    },
    update: videoImage,
    create: videoImage
  })
}

export async function importMany(rows: unknown[]): Promise<void> {
  const { data: videoImages, inValidRowIds } = parseMany(videoImageSchema, rows)

  if (videoImages.length !== rows.length)
    throw new Error(`some rows do not match schema: ${inValidRowIds.join(',')}`)

  await prisma.cloudflareImage.createMany({
    data: videoImages.filter(({ videoId }) => getVideoIds().includes(videoId)),
    skipDuplicates: true
  })
}
