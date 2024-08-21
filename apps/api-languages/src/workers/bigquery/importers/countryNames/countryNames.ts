import omit from 'lodash/omit'
import { z } from 'zod'

import { Prisma } from '.prisma/api-languages-client'

import { prisma } from '../../../../lib/prisma'
import { parse, parseMany, processTable } from '../../importer'

const countryNameSchema = z
  .object({
    languageId: z.number().transform(String),
    shortName: z.string(),
    value: z.string()
  })
  .transform((value) => ({
    ...omit(value, ['shortName']),
    countryId: value.shortName,
    primary: value.languageId === '529'
  }))

const bigQueryTableName =
  'jfp-data-warehouse.jfp_mmdb_prod.core_countryNames_arclight_data'

let existingLanguageIds: string[]
let existingCountryIds: string[]

export async function importCountryNames(
  languageIds: string[],
  countryIds: string[]
): Promise<void> {
  existingLanguageIds = languageIds
  existingCountryIds = countryIds

  await processTable(bigQueryTableName, importOne, importMany, true)
}

export async function importOne(row: unknown): Promise<void> {
  const data = parse<Prisma.CountryNameUncheckedCreateInput>(
    countryNameSchema,
    row
  )
  if (!existingCountryIds.includes(data.countryId))
    throw new Error(`Country with id ${data.countryId} not found`)

  if (!existingLanguageIds.includes(data.languageId))
    throw new Error(`Language with id ${data.languageId} not found`)

  await prisma.countryName.upsert({
    where: {
      languageId_countryId: {
        languageId: data.languageId,
        countryId: data.countryId
      }
    },
    update: data,
    create: data
  })
}

export async function importMany(rows: unknown[]): Promise<void> {
  const { data, inValidRowIds } =
    parseMany<Prisma.CountryNameUncheckedCreateInput>(countryNameSchema, rows)
  await prisma.countryName.createMany({
    data: data.filter(
      ({ countryId, languageId }) =>
        existingCountryIds.includes(countryId) &&
        existingLanguageIds.includes(languageId)
    ),
    skipDuplicates: true
  })
  if (data.length !== rows.length) {
    throw new Error(`some rows do not match schema: ${inValidRowIds.join(',')}`)
  }
}
