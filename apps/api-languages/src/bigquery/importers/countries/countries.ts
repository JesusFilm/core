import { z } from 'zod'
import omit from 'lodash/omit'

import { prisma } from '../../../lib/prisma'
import { parseMany, processTable } from '../../importer'
import { parse } from '../../importer'
import { Prisma } from '.prisma/api-languages-client'

const countrySchema = z
  .object({
    shortName: z.string(),
    country_population: z.number().nullable(),
    latitude: z.number().nullable(),
    longitude: z.number().nullable(),
    flagPngSrc: z.string().nullable(),
    flagWebpSrc: z.string().nullable()
  })
  .transform((value) => ({
    ...omit(value, ['shortName', 'country_population']),
    id: value.shortName,
    population: value.country_population
  }))

let existingCountryIds: string[]

const bigQueryTableName =
  'jfp-data-warehouse.jfp_mmdb_prod.core_countries_arclight_data'

export async function getExistingPrismaCountryIds(): Promise<string[]> {
  const prismaCountries = await prisma.country.findMany({
    select: {
      id: true
    }
  })
  return prismaCountries.map(({ id }) => id)
}

export async function importCountries(): Promise<string[]> {
  existingCountryIds = await getExistingPrismaCountryIds()
  await processTable(bigQueryTableName, importOne, importMany, true)
  return existingCountryIds
}

export async function importOne(row: unknown): Promise<void> {
  const data = parse<Prisma.CountryUncheckedCreateInput>(countrySchema, row)

  await prisma.country.upsert({
    where: {
      id: data.id
    },
    update: data,
    create: data
  })
}

export async function importMany(rows: unknown[]): Promise<void> {
  const { data, inValidRowIds } = parseMany<Prisma.CountryUncheckedCreateInput>(
    countrySchema,
    rows
  )
  await prisma.country.createMany({
    data,
    skipDuplicates: true
  })
  if (data.length !== rows.length) {
    throw new Error(`some rows do not match schema: ${inValidRowIds.join(',')}`)
  }
}
