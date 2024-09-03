import { Logger } from 'pino'
import { z } from 'zod'

import { prisma } from '../../../../lib/prisma'
import { parse, parseMany, processTable } from '../../importer'
import { getVideoIds } from '../videos'

const videoDescriptionSchema = z.object({
  value: z.string(),
  videoId: z.string(),
  languageId: z.number().transform(String),
  primary: z.number().transform(Boolean)
})

export async function importVideoDescriptions(logger?: Logger): Promise<void> {
  await processTable(
    'jfp-data-warehouse.jfp_mmdb_prod.core_videoDescription_arclight_data',
    importOne,
    importMany,
    true,
    logger
  )
}

export async function importOne(row: unknown): Promise<void> {
  const videoDescription = parse(videoDescriptionSchema, row)
  if (!getVideoIds().includes(videoDescription.videoId))
    throw new Error(`Video with id ${videoDescription.videoId} not found`)

  await prisma.videoDescription.upsert({
    where: {
      videoId_languageId: {
        videoId: videoDescription.videoId,
        languageId: videoDescription.languageId
      }
    },
    update: videoDescription,
    create: videoDescription
  })
}

export async function importMany(rows: unknown[]): Promise<void> {
  const { data: videoDescriptions, inValidRowIds } = parseMany(
    videoDescriptionSchema,
    rows
  )

  if (videoDescriptions.length !== rows.length)
    throw new Error(`some rows do not match schema: ${inValidRowIds.join(',')}`)

  await prisma.videoDescription.createMany({
    data: videoDescriptions.filter(({ videoId }) =>
      getVideoIds().includes(videoId)
    ),
    skipDuplicates: true
  })
}
