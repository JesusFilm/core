import { z } from 'zod'

import { Prisma } from '.prisma/api-languages-client'

import { prisma } from '../../../lib/prisma'
import { parse, parseMany, processTable } from '../../importer'

const languageNameSchema = z
  .object({
    languageId: z.number().transform(String),
    parentLanguageId: z.number().transform(String),
    value: z.string()
  })
  .transform((value) => ({
    ...value,
    primary: value.languageId === value.parentLanguageId
  }))

const bigQueryTableName =
  'jfp-data-warehouse.jfp_mmdb_prod.core_languageNames_arclight_data'

let existingLanguageIds: string[]

export async function importLanguageNames(
  languageIds: string[]
): Promise<void> {
  existingLanguageIds = languageIds

  await processTable(bigQueryTableName, importOne, importMany, true)
}

export async function importOne(row: unknown): Promise<void> {
  const data = parse<Prisma.LanguageNameUncheckedCreateInput>(
    languageNameSchema,
    row
  )
  if (!existingLanguageIds.includes(data.parentLanguageId))
    throw new Error(`Language with id ${data.parentLanguageId} not found`)

  if (!existingLanguageIds.includes(data.languageId))
    throw new Error(`Language with id ${data.languageId} not found`)

  await prisma.languageName.upsert({
    where: {
      parentLanguageId_languageId: {
        languageId: data.languageId,
        parentLanguageId: data.parentLanguageId
      }
    },
    update: data,
    create: data
  })
}

export async function importMany(rows: unknown[]): Promise<void> {
  const { data, inValidRowIds } =
    parseMany<Prisma.LanguageNameUncheckedCreateInput>(languageNameSchema, rows)
  await prisma.languageName.createMany({
    data: data.filter(
      ({ parentLanguageId, languageId }) =>
        existingLanguageIds.includes(parentLanguageId) &&
        existingLanguageIds.includes(languageId)
    ),
    skipDuplicates: true
  })
  if (data.length !== rows.length) {
    throw new Error(`some rows do not match schema: ${inValidRowIds.join(',')}`)
  }
}
