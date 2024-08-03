import omit from 'lodash/omit'
import { z } from 'zod'

import { Prisma } from '.prisma/api-languages-client'

import { prisma } from '../../../lib/prisma'
import { parse, parseMany, processTable } from '../../importer'

const countryLanguageSchema = z
  .object({
    languageId: z.number().transform(String),
    countryCode: z.string(),
    speakers: z.number(),
    display_speakers: z.number().nullable()
  })
  .transform((value) => ({
    ...omit(value, ['countryCode', 'display_speakers']),
    countryId: value.countryCode,
    displaySpeakers: value.display_speakers
  }))

const bigQueryTableName =
  'jfp-data-warehouse.jfp_mmdb_prod.core_countryLanguages_arclight_data'

let existingLanguageIds: string[]
let existingCountryIds: string[]

export async function importCountryLanguages(
  languageIds: string[],
  countryIds: string[]
): Promise<void> {
  existingLanguageIds = languageIds
  existingCountryIds = countryIds

  await processTable(bigQueryTableName, importOne, importMany, true)
}

export async function importOne(row: unknown): Promise<void> {
  const data = parse<Prisma.CountryLanguageUncheckedCreateInput>(
    countryLanguageSchema,
    row
  )
  if (!existingCountryIds.includes(data.countryId))
    throw new Error(`Country with id ${data.countryId} not found`)

  if (!existingLanguageIds.includes(data.languageId))
    throw new Error(`Language with id ${data.languageId} not found`)

  await prisma.countryLanguage.upsert({
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
    parseMany<Prisma.CountryLanguageUncheckedCreateInput>(
      countryLanguageSchema,
      rows
    )
  await prisma.countryLanguage.createMany({
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
