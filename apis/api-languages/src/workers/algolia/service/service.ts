import { algoliasearch } from 'algoliasearch'
import { Logger } from 'pino'

import { prisma } from '@core/prisma/languages/client'

async function configureIndexSettings(
  client: ReturnType<typeof algoliasearch>,
  languageIndex: string,
  countryIndex: string,
  logger?: Logger
): Promise<void> {
  try {
    await client.setSettings({
      indexName: languageIndex,
      indexSettings: {
        searchableAttributes: ['names.value'],
        customRanking: ['desc(speakersCount)'],
        attributesForFaceting: ['names.bcp47']
      },
      forwardToReplicas: true
    })
    logger?.info('Successfully configured language index settings')

    await client.setSettings({
      indexName: countryIndex,
      indexSettings: {
        searchableAttributes: ['names.value', 'continentName'],
        attributesForFaceting: ['names.bcp47']
      },
      forwardToReplicas: true
    })
    logger?.info('Successfully configured country index settings')
  } catch (error) {
    logger?.error(error, 'unable to configure index settings')
  }
}

async function indexLanguages(
  client: ReturnType<typeof algoliasearch>,
  languageIndex: string,
  languageBcp47Map: Map<string, string>,
  logger?: Logger
): Promise<void> {
  try {
    const languages = await prisma.language.findMany({
      include: {
        name: true,
        countryLanguages: {
          include: {
            country: true
          }
        }
      },
      where: {
        hasVideos: true
      }
    })

    logger?.info(`Found ${languages.length} languages with videos`)

    if (languages.length === 0) {
      return
    }

    const transformedLanguages = languages.map((language) => {
      const primaryCountry = language.countryLanguages.find(
        (countryLanguage) => countryLanguage.primary
      )

      const nameNative = language.name.find(
        ({ languageId }) => languageId === language.id
      )?.value

      const names = language.name
        .map((name) => ({
          value: name.value,
          languageId: name.languageId,
          bcp47: languageBcp47Map.get(name.languageId) ?? ''
        }))
        .filter(
          (
            name
          ): name is { value: string; languageId: string; bcp47: string } =>
            Boolean(name.value && name.bcp47)
        )

      const speakersCount = language.countryLanguages.reduce(
        (sum, country) => sum + (country.speakers ?? 0),
        0
      )

      return {
        objectID: language.id,
        languageId: parseInt(language.id, 10),
        iso3: language.iso3,
        bcp47: language.bcp47,
        primaryCountryId: primaryCountry?.countryId,
        nameNative,
        names,
        speakersCount
      }
    })

    try {
      await client.saveObjects({
        indexName: languageIndex,
        objects: transformedLanguages,
        waitForTasks: true
      })
      logger?.info(
        `Successfully exported ${transformedLanguages.length} records to algolia`
      )
    } catch (error) {
      logger?.error(error, 'unable to export language records to algolia')
    }
  } catch (error) {
    logger?.error(error, 'unable to complete language processing loop')
  }
}

async function indexCountries(
  client: ReturnType<typeof algoliasearch>,
  countryIndex: string,
  languageBcp47Map: Map<string, string>,
  logger?: Logger
): Promise<void> {
  try {
    const countries = await prisma.country.findMany({
      include: {
        name: true,
        continent: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    logger?.info(`Found ${countries.length} countries to index`)

    if (countries.length === 0) {
      return
    }

    const transformedCountries = countries.map((country) => {
      const names = country.name.map((name) => ({
        value: name.value,
        languageId: name.languageId,
        bcp47: languageBcp47Map.get(name.languageId) ?? ''
      }))

      return {
        objectID: country.id,
        countryId: country.id,
        names,
        continentName: country.continent?.name.find(
          ({ languageId }) => languageId === '529'
        )?.value,
        longitude: country.longitude,
        latitude: country.latitude
      }
    })

    try {
      await client.saveObjects({
        indexName: countryIndex,
        objects: transformedCountries,
        waitForTasks: true
      })
      logger?.info(
        `Successfully exported ${transformedCountries.length} countries to algolia`
      )
    } catch (error) {
      logger?.error(error, 'unable to export country records to algolia')
    }
  } catch (error) {
    logger?.error(error, 'unable to complete country processing loop')
  }
}

export async function service(logger?: Logger): Promise<void> {
  const apiKey = process.env.ALGOLIA_API_KEY_LANGUAGES ?? ''
  const appId = process.env.ALGOLIA_APPLICATION_ID ?? ''
  const languageIndex = process.env.ALGOLIA_INDEX_LANGUAGES ?? ''
  const countryIndex = process.env.ALGOLIA_INDEX_COUNTRIES ?? ''

  if (
    apiKey === '' ||
    appId === '' ||
    languageIndex === '' ||
    countryIndex === ''
  ) {
    throw new Error('algolia environment variables not set')
  }

  const client = algoliasearch(appId, apiKey)

  try {
    await configureIndexSettings(client, languageIndex, countryIndex, logger)

    const allLanguages = await prisma.language.findMany({
      select: {
        id: true,
        bcp47: true
      }
    })

    const languageBcp47Map = new Map(
      allLanguages
        .filter(
          (lang): lang is { id: string; bcp47: string } => lang.bcp47 != null
        )
        .map((lang) => [lang.id, lang.bcp47])
    )

    await indexLanguages(client, languageIndex, languageBcp47Map, logger)
    await indexCountries(client, countryIndex, languageBcp47Map, logger)

    logger?.info(`Using Algolia indexes: ${languageIndex}, ${countryIndex}`)
  } catch (error) {
    logger?.error(error, 'unable to complete indexing process')
  }
}
