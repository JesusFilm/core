import { Logger } from 'pino'
import { z } from 'zod'

import { prisma } from '../../../../lib/prisma'
import { parse, parseMany, processTable } from '../../importer'
import { getLanguageIds } from '../languages'

const languageNameSchema = z
  .object({
    languageId: z.number().transform(String),
    parentLanguageId: z.number().transform(String),
    value: z.string().nullable()
  })
  .transform((value) => ({
    ...value,
    primary: value.languageId === value.parentLanguageId,
    value: value.value === null ? '' : value.value
  }))

export async function importLanguageNames(logger?: Logger): Promise<void> {
  await processTable(
    'jfp-data-warehouse.jfp_mmdb_prod.core_languageNames_arclight_data',
    importOne,
    importMany,
    true,
    logger
  )
}

export async function importOne(row: unknown): Promise<void> {
  const languageName = parse(languageNameSchema, row)

  if (!getLanguageIds().includes(languageName.parentLanguageId))
    throw new Error(
      `Parent Language with id ${languageName.parentLanguageId} not found`
    )

  if (!getLanguageIds().includes(languageName.languageId))
    throw new Error(`Language with id ${languageName.languageId} not found`)

  await prisma.languageName.upsert({
    where: {
      parentLanguageId_languageId: {
        languageId: languageName.languageId,
        parentLanguageId: languageName.parentLanguageId
      }
    },
    update: languageName,
    create: languageName
  })
}

export async function importMany(rows: unknown[]): Promise<void> {
  const { data: languageNames, inValidRowIds } = parseMany(
    languageNameSchema,
    rows
  )

  if (languageNames.length !== rows.length)
    throw new Error(`some rows do not match schema: ${inValidRowIds.join(',')}`)

  await prisma.languageName.createMany({
    data: languageNames.filter(
      ({ parentLanguageId, languageId }) =>
        getLanguageIds().includes(parentLanguageId) &&
        getLanguageIds().includes(languageId)
    ),
    skipDuplicates: true
  })
}
