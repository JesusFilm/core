import { z } from 'zod'

import { Prisma } from '.prisma/api-languages-client'

import { prisma } from '../../../../lib/prisma'
import { parse, parseMany, processTable } from '../../importer'

const audioPreviewSchema = z.object({
  languageId: z.number().transform(String),
  duration: z.number(),
  size: z.number(),
  value: z.string(),
  updatedAt: z.object({ value: z.string() }).transform((value) => value.value)
})

const bigQueryTableName =
  'jfp-data-warehouse.jfp_mmdb_prod.core_audioPreview_arclight_data'

let existingLanguageIds: string[]

export async function importAudioPreview(languageIds: string[]): Promise<void> {
  existingLanguageIds = languageIds

  await processTable(bigQueryTableName, importOne, importMany, true)
}

export async function importOne(row: unknown): Promise<void> {
  const data = parse<Prisma.AudioPreviewUncheckedCreateInput>(
    audioPreviewSchema,
    row
  )
  if (!existingLanguageIds.includes(data.languageId))
    throw new Error(`Language with id ${data.languageId} not found`)

  await prisma.audioPreview.upsert({
    where: {
      languageId: data.languageId
    },
    update: data,
    create: data
  })
}

export async function importMany(rows: unknown[]): Promise<void> {
  const { data, inValidRowIds } =
    parseMany<Prisma.AudioPreviewUncheckedCreateInput>(audioPreviewSchema, rows)
  await prisma.audioPreview.createMany({
    data: data.filter(({ languageId }) =>
      existingLanguageIds.includes(languageId)
    ),
    skipDuplicates: true
  })
  if (data.length !== rows.length) {
    throw new Error(`some rows do not match schema: ${inValidRowIds.join(',')}`)
  }
}
