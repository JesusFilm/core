import compact from 'lodash/compact'
import omit from 'lodash/omit'
import uniq from 'lodash/uniq'
import { z } from 'zod'

import { Prisma } from '.prisma/api-languages-client'

import { prisma } from '../../../lib/prisma'
import { parse, parseMany, processTable } from '../../importer'

const countrySchema = z
  .object({
    shortName: z.string(),
    country_population: z.number().nullable(),
    latitude: z.number().nullable(),
    longitude: z.number().nullable(),
    flagPngSrc: z.string().nullable(),
    flagWebpSrc: z.string().nullable(),
    continentName: z.string().nullable()
  })
  .transform((value) => ({
    ...omit(value, ['shortName', 'country_population', 'continentName']),
    id: value.shortName,
    population: value.country_population,
    continentId: value.continentName
  }))

let existingCountryIds: string[]
let existingContinentNames: string[]

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

export async function getExistingContinentIds(): Promise<string[]> {
  const prismaContinents = await prisma.continent.findMany({
    select: {
      id: true
    }
  })
  return prismaContinents.map(({ id }) => id)
}

export async function importCountries(): Promise<string[]> {
  existingCountryIds = await getExistingPrismaCountryIds()
  existingContinentNames = await getExistingContinentIds()
  await processTable(bigQueryTableName, importOne, importMany, true)
  return existingCountryIds
}

export async function importOne(row: unknown): Promise<void> {
  const data = parse<Prisma.CountryUncheckedCreateInput>(countrySchema, row)

  if (!existingCountryIds.includes(data.id)) existingCountryIds.push(data.id)

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

  const continents = uniq(compact(data.map(({ continentId }) => continentId)))

  for (const continent of continents) {
    if (!existingContinentNames.includes(continent))
      await prisma.continent.create({
        data: {
          id: continent,
          name: {
            create: {
              value: continent,
              languageId: '529',
              primary: true
            }
          }
        }
      })
  }

  existingContinentNames = uniq(existingContinentNames.concat(continents))

  await prisma.country.createMany({
    data: data.filter(({ id }) => !existingCountryIds.includes(id)),
    skipDuplicates: true
  })

  existingCountryIds = existingCountryIds.concat(data.map(({ id }) => id))

  if (data.length !== rows.length) {
    throw new Error(`some rows do not match schema: ${inValidRowIds.join(',')}`)
  }
}
