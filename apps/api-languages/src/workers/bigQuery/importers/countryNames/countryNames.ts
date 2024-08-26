import omit from 'lodash/omit'
import { Logger } from 'pino'
import { z } from 'zod'

import { prisma } from '../../../../lib/prisma'
import { parse, parseMany, processTable } from '../../importer'
import { getCountryIds } from '../countries'
import { getLanguageIds } from '../languages'

const countryNameSchema = z
  .object({
    languageId: z.number().transform(String),
    shortName: z.string(),
    value: z.string().nullable()
  })
  .transform((value) => ({
    ...omit(value, ['shortName']),
    countryId: value.shortName,
    primary: value.languageId === '529',
    value: value.value === null ? '' : value.value
  }))

export async function importCountryNames(logger?: Logger): Promise<void> {
  await processTable(
    'jfp-data-warehouse.jfp_mmdb_prod.core_countryNames_arclight_data',
    importOne,
    importMany,
    true,
    logger
  )
}

export async function importOne(row: unknown): Promise<void> {
  const countryName = parse(countryNameSchema, row)
  if (!getCountryIds().includes(countryName.countryId))
    throw new Error(`Country with id ${countryName.countryId} not found`)

  if (!getLanguageIds().includes(countryName.languageId))
    throw new Error(`Language with id ${countryName.languageId} not found`)

  await prisma.countryName.upsert({
    where: {
      languageId_countryId: {
        languageId: countryName.languageId,
        countryId: countryName.countryId
      }
    },
    update: countryName,
    create: countryName
  })
}

export async function importMany(rows: unknown[]): Promise<void> {
  const { data: countryNames, inValidRowIds } = parseMany(
    countryNameSchema,
    rows
  )

  if (countryNames.length !== rows.length)
    throw new Error(`some rows do not match schema: ${inValidRowIds.join(',')}`)

  await prisma.countryName.createMany({
    data: countryNames.filter(
      ({ countryId, languageId }) =>
        getCountryIds().includes(countryId) &&
        getLanguageIds().includes(languageId)
    ),
    skipDuplicates: true
  })
}
