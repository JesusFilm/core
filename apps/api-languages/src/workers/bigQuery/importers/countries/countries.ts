import compact from 'lodash/compact'
import omit from 'lodash/omit'
import uniq from 'lodash/uniq'
import { Logger } from 'pino'
import { z } from 'zod'

import { prisma } from '../../../../lib/prisma'
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

let countryIds: string[] = []

export function setCountryIds(countries: Array<{ id: string }>): void {
  countryIds = countries.map(({ id }) => id)
}

export function getCountryIds(): string[] {
  return countryIds
}

let continentIds: string[] = []

export function setContinentIds(continents: Array<{ id: string }>): void {
  continentIds = continents.map(({ id }) => id)
}

export function getContinentIds(): string[] {
  return continentIds
}

export async function importCountries(logger?: Logger): Promise<() => void> {
  setContinentIds(
    await prisma.continent.findMany({
      select: {
        id: true
      }
    })
  )
  await processTable(
    'jfp-data-warehouse.jfp_mmdb_prod.core_countries_arclight_data',
    importOne,
    importMany,
    true,
    logger
  )
  setCountryIds(
    await prisma.country.findMany({
      select: {
        id: true
      }
    })
  )
  return () => {
    setCountryIds([])
    setContinentIds([])
  }
}

export async function importOne(row: unknown): Promise<void> {
  const country = parse(countrySchema, row)

  await prisma.country.upsert({
    where: {
      id: country.id
    },
    update: country,
    create: country
  })
}

export async function importMany(rows: unknown[]): Promise<void> {
  const { data: countries, inValidRowIds } = parseMany(countrySchema, rows)

  if (countries.length !== rows.length)
    throw new Error(`some rows do not match schema: ${inValidRowIds.join(',')}`)

  const continents = uniq(
    compact(countries.map(({ continentId }) => continentId))
  )

  for (const continent of continents) {
    if (!continentIds.includes(continent)) {
      const prismaContinent = await prisma.continent.create({
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
      continentIds.push(prismaContinent.id)
    }
  }

  await prisma.country.createMany({
    data: countries,
    skipDuplicates: true
  })
}
