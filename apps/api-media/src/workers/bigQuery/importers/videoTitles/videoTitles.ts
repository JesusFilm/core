import { Logger } from 'pino'
import { z } from 'zod'

import { prisma } from '../../../../lib/prisma'
import { parse, parseMany, processTable } from '../../importer'
import { getVideoIds } from '../videos'

const videoTitleSchema = z.object({
  value: z.string(),
  videoId: z.string(),
  languageId: z.number().transform(String),
  primary: z.number().transform(Boolean)
})

export async function importVideoTitles(logger?: Logger): Promise<void> {
  await processTable(
    'jfp-data-warehouse.jfp_mmdb_prod.core_videoTitle_arclight_data',
    importOne,
    importMany,
    true,
    logger
  )
}

export async function importOne(row: unknown): Promise<void> {
  const videoTitle = parse(videoTitleSchema, row)
  if (!getVideoIds().includes(videoTitle.videoId))
    throw new Error(`Video with id ${videoTitle.videoId} not found`)

  await prisma.videoTitle.upsert({
    where: {
      videoId_languageId: {
        videoId: videoTitle.videoId,
        languageId: videoTitle.languageId
      }
    },
    update: videoTitle,
    create: videoTitle
  })
}

export async function importMany(rows: unknown[]): Promise<void> {
  const { data: videoTitles, inValidRowIds } = parseMany(videoTitleSchema, rows)

  if (videoTitles.length !== rows.length)
    throw new Error(`some rows do not match schema: ${inValidRowIds.join(',')}`)

  await prisma.videoTitle.createMany({
    data: videoTitles.filter(({ videoId }) => getVideoIds().includes(videoId)),
    skipDuplicates: true
  })
}
