import omit from 'lodash/omit'
import { Logger } from 'pino'
import { z } from 'zod'

import { prisma } from '../../../../lib/prisma'
import { parse, parseMany, processTable } from '../../importer'
import { getCountryIds } from '../countries'
import { getLanguageIds } from '../languages'

const countryLanguageSchema = z
  .object({
    languageId: z.number().transform(String),
    countryCode: z.string(),
    speakers: z.number().nullable(),
    display_speakers: z.number().nullable(),
    primary: z.number().nullable(),
    suggested: z.number().nullable(),
    order: z.number().nullable()
  })
  .transform((value) => ({
    ...omit(value, ['countryCode', 'display_speakers']),
    speakers: value.speakers ?? 0,
    primary: value.primary === 1,
    countryId: value.countryCode,
    displaySpeakers: value.display_speakers ?? 0,
    suggested: value.suggested === 1
  }))

export async function importCountryLanguages(logger?: Logger): Promise<void> {
  await processTable(
    'jfp-data-warehouse.jfp_mmdb_prod.core_countryLanguages_arclight_data',
    importOne,
    importMany,
    true,
    logger
  )
}

export async function importOne(row: unknown): Promise<void> {
  const countryLanguage = parse(countryLanguageSchema, row)
  if (!getCountryIds().includes(countryLanguage.countryId))
    throw new Error(`Country with id ${countryLanguage.countryId} not found`)

  if (!getLanguageIds().includes(countryLanguage.languageId))
    throw new Error(`Language with id ${countryLanguage.languageId} not found`)

  await prisma.countryLanguage.upsert({
    where: {
      languageId_countryId_suggested: {
        languageId: countryLanguage.languageId,
        countryId: countryLanguage.countryId,
        suggested: countryLanguage.suggested
      }
    },
    update: countryLanguage,
    create: countryLanguage
  })
}

export async function importMany(rows: unknown[]): Promise<void> {
  const { data: countryLanguages, inValidRowIds } = parseMany(
    countryLanguageSchema,
    rows
  )

  if (countryLanguages.length !== rows.length)
    throw new Error(`some rows do not match schema: ${inValidRowIds.join(',')}`)

  await prisma.countryLanguage.createMany({
    data: countryLanguages.filter(
      ({ countryId, languageId }) =>
        getCountryIds().includes(countryId) &&
        getLanguageIds().includes(languageId)
    ),
    skipDuplicates: true
  })
}
