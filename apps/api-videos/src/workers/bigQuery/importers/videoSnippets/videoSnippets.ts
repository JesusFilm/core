import { Logger } from 'pino'
import { z } from 'zod'

import { prisma } from '../../../../lib/prisma'
import { parse, parseMany, processTable } from '../../importer'
import { getVideoIds } from '../videos'

const videoSnippetSchema = z.object({
  value: z.string(),
  videoId: z.string(),
  languageId: z.number().transform(String),
  primary: z.number().transform(Boolean)
})

export async function importVideoSnippets(logger?: Logger): Promise<void> {
  await processTable(
    'jfp-data-warehouse.jfp_mmdb_prod.core_videoSnippet_arclight_data',
    importOne,
    importMany,
    true,
    logger
  )
}

export async function importOne(row: unknown): Promise<void> {
  const videoSnippet = parse(videoSnippetSchema, row)
  if (!getVideoIds().includes(videoSnippet.videoId))
    throw new Error(`Video with id ${videoSnippet.videoId} not found`)

  await prisma.videoSnippet.upsert({
    where: {
      videoId_languageId: {
        videoId: videoSnippet.videoId,
        languageId: videoSnippet.languageId
      }
    },
    update: videoSnippet,
    create: videoSnippet
  })
}

export async function importMany(rows: unknown[]): Promise<void> {
  const { data: videoSnippets, inValidRowIds } = parseMany(
    videoSnippetSchema,
    rows
  )

  if (videoSnippets.length !== rows.length)
    throw new Error(`some rows do not match schema: ${inValidRowIds.join(',')}`)

  await prisma.videoSnippet.createMany({
    data: videoSnippets.filter(({ videoId }) =>
      getVideoIds().includes(videoId)
    ),
    skipDuplicates: true
  })
}
