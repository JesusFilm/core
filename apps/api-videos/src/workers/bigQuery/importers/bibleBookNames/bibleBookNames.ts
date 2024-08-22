import { z } from 'zod'

import { Prisma } from '.prisma/api-videos-client'

import { prisma } from '../../../../lib/prisma'
import { parse, parseMany, processTable } from '../../importer'

const bibleBookNameSchema = z
  .object({
    bibleBook: z.number().transform(String),
    translatedName: z.string(),
    languageId: z.number().transform(String)
  })
  .transform((data) => ({
    bibleBookId: data.bibleBook,
    languageId: data.languageId,
    value: data.translatedName,
    primary: data.languageId === '529'
  }))

let existingBibleBookIds: string[]

export async function importBibleBookNames(
  bibleBookIds: string[]
): Promise<void> {
  existingBibleBookIds = bibleBookIds

  await processTable(
    'jfp-data-warehouse.jfp_mmdb_prod.core_bibleBookDescriptors_arclight_data',
    importOne,
    importMany,
    true
  )
}

export async function importOne(row: unknown): Promise<void> {
  const bibleBookName = parse<Prisma.BibleBookNameUncheckedCreateInput>(
    bibleBookNameSchema,
    row
  )
  if (!existingBibleBookIds.includes(bibleBookName.bibleBookId))
    throw new Error(`BibleBook with id ${bibleBookName.bibleBookId} not found`)

  await prisma.bibleBookName.upsert({
    where: {
      bibleBookId_languageId: {
        bibleBookId: bibleBookName.bibleBookId,
        languageId: bibleBookName.languageId
      }
    },
    update: bibleBookName,
    create: bibleBookName
  })
}

export async function importMany(rows: unknown[]): Promise<void> {
  const { data, inValidRowIds } =
    parseMany<Prisma.BibleBookNameUncheckedCreateInput>(
      bibleBookNameSchema,
      rows
    )
  await prisma.bibleBookName.createMany({
    data: data.filter(({ bibleBookId }) =>
      existingBibleBookIds.includes(bibleBookId)
    ),
    skipDuplicates: true
  })
  if (data.length !== rows.length)
    throw new Error(`some rows do not match schema: ${inValidRowIds.join(',')}`)
}
