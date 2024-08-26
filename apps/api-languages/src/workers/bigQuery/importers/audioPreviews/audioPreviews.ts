import { Logger } from 'pino'
import { z } from 'zod'

import { prisma } from '../../../../lib/prisma'
import { parse, parseMany, processTable } from '../../importer'
import { getLanguageIds } from '../languages'

const audioPreviewSchema = z.object({
  languageId: z.number().transform(String),
  duration: z.number(),
  size: z.number(),
  value: z.string(),
  updatedAt: z.object({ value: z.string() }).transform((value) => value.value)
})

export async function importAudioPreviews(logger?: Logger): Promise<void> {
  await processTable(
    'jfp-data-warehouse.jfp_mmdb_prod.core_audioPreview_arclight_data',
    importOne,
    importMany,
    true,
    logger
  )
}

export async function importOne(row: unknown): Promise<void> {
  const audioPreview = parse(audioPreviewSchema, row)
  if (!getLanguageIds().includes(audioPreview.languageId))
    throw new Error(`Language with id ${audioPreview.languageId} not found`)

  await prisma.audioPreview.upsert({
    where: {
      languageId: audioPreview.languageId
    },
    update: audioPreview,
    create: audioPreview
  })
}

export async function importMany(rows: unknown[]): Promise<void> {
  const { data: audioPreviews, inValidRowIds } = parseMany(
    audioPreviewSchema,
    rows
  )

  if (audioPreviews.length !== rows.length)
    throw new Error(`some rows do not match schema: ${inValidRowIds.join(',')}`)

  await prisma.audioPreview.createMany({
    data: audioPreviews.filter(({ languageId }) =>
      getLanguageIds().includes(languageId)
    ),
    skipDuplicates: true
  })
}
