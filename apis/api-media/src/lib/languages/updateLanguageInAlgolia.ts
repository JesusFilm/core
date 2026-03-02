import { algoliasearch } from 'algoliasearch'
import type { Logger } from 'pino'

import { prisma as languagesPrisma } from '@core/prisma/languages/client'

function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (value == null || value.trim() === '') {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

export async function updateLanguageInAlgoliaFromMedia(
  languageId: string,
  logger?: Logger
): Promise<void> {
  const appId = getRequiredEnv('ALGOLIA_APPLICATION_ID')
  const apiKey = getRequiredEnv('ALGOLIA_API_KEY')
  const languagesIndex = getRequiredEnv('ALGOLIA_INDEX_LANGUAGES')

  const client = algoliasearch(appId, apiKey)

  try {
    const language = await languagesPrisma.language.findUnique({
      where: { id: languageId },
      select: {
        id: true,
        bcp47: true,
        iso3: true,
        name: {
          select: {
            value: true,
            primary: true,
            language: {
              select: {
                id: true,
                bcp47: true
              }
            }
          }
        },
        countryLanguages: {
          select: {
            speakers: true,
            suggested: true,
            primary: true,
            country: {
              select: { id: true }
            }
          }
        }
      }
    })

    if (language == null) {
      logger?.warn(`language ${languageId} not found`)
      return
    }

    const nonSuggestedCountryLanguages = language.countryLanguages.filter(
      ({ suggested }) => !suggested
    )
    const speakersCount = nonSuggestedCountryLanguages.reduce(
      (acc, { speakers }) => acc + speakers,
      0
    )

    const primaryCountryLanguage = language.countryLanguages.find(
      ({ primary }) => primary
    )
    const primaryCountryId =
      primaryCountryLanguage?.country.id ??
      language.countryLanguages[0]?.country.id ??
      'US'

    const nameNative =
      language.name.find(({ primary }) => primary)?.value ??
      language.name[0]?.value ??
      ''

    const names = language.name.map((name) => ({
      value: name.value,
      languageId: name.language?.id ?? '',
      bcp47: name.language?.bcp47 ?? ''
    }))

    const transformedLanguage = {
      objectID: language.id,
      languageId: language.id,
      bcp47: language.bcp47,
      iso3: language.iso3,
      nameNative,
      speakersCount,
      primaryCountryId,
      names
    }

    await client.saveObjects({
      indexName: languagesIndex,
      objects: [transformedLanguage],
      waitForTasks: true
    })
  } catch (error) {
    logger?.error(error, `failed to update language ${languageId} in algolia`)
  }
}
