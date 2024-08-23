import { Logger } from 'pino'
import { z } from 'zod'

import { prisma } from '../../../../lib/prisma'
import { parse, parseMany, processTable } from '../../importer'
import { getBibleBookIds } from '../bibleBooks'

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

export async function importBibleBookNames(logger?: Logger): Promise<void> {
  await processTable(
    'jfp-data-warehouse.jfp_mmdb_prod.core_bibleBookDescriptors_arclight_data',
    importOne,
    importMany,
    true,
    logger
  )
}

export async function importOne(row: unknown): Promise<void> {
  const bibleBookName = parse(bibleBookNameSchema, row)
  if (!getBibleBookIds().includes(bibleBookName.bibleBookId))
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
  const { data: bibleBookNames, inValidRowIds } = parseMany(
    bibleBookNameSchema,
    rows
  )

  if (bibleBookNames.length !== rows.length)
    throw new Error(`some rows do not match schema: ${inValidRowIds.join(',')}`)

  await prisma.bibleBookName.createMany({
    data: bibleBookNames.filter(({ bibleBookId }) =>
      getBibleBookIds().includes(bibleBookId)
    ),
    skipDuplicates: true
  })
}
