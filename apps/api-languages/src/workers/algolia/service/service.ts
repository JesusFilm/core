import algoliasearch from 'algoliasearch'
import { Logger } from 'pino'

import { prisma } from '../../../lib/prisma'

export async function service(logger?: Logger): Promise<void> {
  const apiKey = process.env.ALGOLIA_API_KEY ?? ''
  const appId = process.env.ALGOLIA_APPLICATION_ID ?? ''
  const appIndex = process.env.ALGOLIA_INDEX ?? ''

  if (apiKey === '' || appId === '' || appIndex === '') {
    throw new Error('algolia environment variables not set')
  }

  const client = algoliasearch(appId, apiKey)

  try {
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

      // Calculate total speakers across all countries
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

    const index = client.initIndex(appIndex)

    try {
      await index.saveObjects(transformedLanguages).wait()
      logger?.info(
        `Successfully exported ${transformedLanguages.length} records to algolia`
      )
    } catch (error) {
      logger?.error(error, 'unable to export test records to algolia')
    }

    logger?.info(`Using Algolia index: ${appIndex}`)
  } catch (error) {
    logger?.error(error, 'unable to complete language processing loop')
  }
}
