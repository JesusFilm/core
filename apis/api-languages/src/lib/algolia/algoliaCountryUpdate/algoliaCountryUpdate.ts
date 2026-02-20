import { Logger } from 'pino'

import { prisma } from '@core/prisma/languages/client'

import { getAlgoliaClient } from '../algoliaClient'

export async function updateCountryInAlgolia(
  countryId: string,
  logger?: Logger
): Promise<void> {
  const client = await getAlgoliaClient(logger)
  const countriesIndex = process.env.ALGOLIA_INDEX_COUNTRIES ?? ''

  if (client == null) {
    logger?.warn('algolia client not found, skipping update')
    return
  }

  try {
    const country = await prisma.country.findUnique({
      where: { id: countryId },
      select: {
        id: true,
        population: true,
        latitude: true,
        longitude: true,
        flagPngSrc: true,
        flagWebpSrc: true,
        name: {
          select: {
            value: true,
            language: {
              select: {
                id: true,
                bcp47: true
              }
            },
            primary: true
          }
        },
        continent: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (country == null) {
      logger?.warn(`country ${countryId} not found`)
      return
    }

    logger?.info(
      `Found country: ${country.id} with ${country.name.length} names`
    )

    // Transform country names with bcp47 codes
    const names = country.name.map((name) => ({
      value: name.value,
      languageId: name.language?.id ?? '',
      bcp47: name.language?.bcp47 ?? ''
    }))

    const transformedCountry = {
      objectID: country.id,
      countryId: country.id,
      population: country.population,
      latitude: country.latitude,
      longitude: country.longitude,
      flagPngSrc: country.flagPngSrc,
      flagWebpSrc: country.flagWebpSrc,
      continent: {
        id: country.continent?.id ?? '',
        name: country.continent?.name ?? ''
      },
      names
    }

    const result = await client.saveObjects({
      indexName: countriesIndex,
      objects: [transformedCountry],
      waitForTasks: true
    })

    logger?.info(
      `Successfully saved country to Algolia. Tasks: ${result.map((r) => r.taskID).join(', ')}`
    )
    logger?.info(
      `Record ${country.id} is now available in index ${countriesIndex}`
    )
  } catch (error) {
    logger?.error(error, `failed to update country ${countryId} in algolia`)
  }
}
