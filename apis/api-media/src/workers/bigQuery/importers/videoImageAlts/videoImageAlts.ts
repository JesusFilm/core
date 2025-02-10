import { Logger } from 'pino'
import { z } from 'zod'

import { prisma } from '../../../../lib/prisma'
import { parse, parseMany, processTable } from '../../importer'
import { getVideoIds } from '../videos'

const videoImageAltSchema = z.object({
  value: z.string(),
  languageId: z.number().transform(String),
  primary: z.number().transform(Boolean),
  videoId: z.string()
})

export async function importVideoImageAlts(logger?: Logger): Promise<void> {
  await processTable(
    'jfp-data-warehouse.jfp_mmdb_prod.core_videoImageAlt_arclight_data',
    importOne,
    importMany,
    true,
    logger
  )
}

export async function importOne(row: unknown): Promise<void> {
  const videoImageAlt = parse(videoImageAltSchema, row)
  if (!getVideoIds().includes(videoImageAlt.videoId))
    throw new Error(`Video with id ${videoImageAlt.videoId} not found`)

  await prisma.videoImageAlt.upsert({
    where: {
      videoId_languageId: {
        videoId: videoImageAlt.videoId,
        languageId: videoImageAlt.languageId
      }
    },
    update: videoImageAlt,
    create: videoImageAlt
  })
}

export async function importMany(rows: unknown[]): Promise<void> {
  const { data: videoImageAlts, inValidRowIds } = parseMany(
    videoImageAltSchema,
    rows
  )

  if (videoImageAlts.length !== rows.length)
    throw new Error(`some rows do not match schema: ${inValidRowIds.join(',')}`)

  await prisma.videoImageAlt.createMany({
    data: videoImageAlts.filter(({ videoId }) =>
      getVideoIds().includes(videoId)
    ),
    skipDuplicates: true
  })
}
