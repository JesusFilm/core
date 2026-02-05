import { Logger } from 'pino'

import { prisma } from '@core/prisma/languages/client'

import { getAlgoliaClient } from '../algoliaClient'

export async function updateLanguageInAlgolia(
  languageId: string,
  logger?: Logger
): Promise<void> {
  const client = await getAlgoliaClient(logger)
  const languagesIndex = process.env.ALGOLIA_INDEX_LANGUAGES ?? ''

  if (client == null) {
    logger?.warn('algolia client not found, skipping update')
    return
  }

  try {
    const language = await prisma.language.findUnique({
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
              select: {
                id: true
              }
            }
          }
        }
      }
    })

    if (language == null) {
      logger?.warn(`language ${languageId} not found`)
      return
    }

    logger?.info(
      `Found language: ${language.bcp47} with ${language.name.length} names`
    )

    // Calculate speaker count from countryLanguages (excluding suggested)
    const nonSuggestedCountryLanguages = language.countryLanguages.filter(
      ({ suggested }) => !suggested
    )
    const speakersCount = nonSuggestedCountryLanguages.reduce(
      (acc, { speakers }) => acc + speakers,
      0
    )

    // Get primary country ID
    const primaryCountryLanguage = language.countryLanguages.find(
      ({ primary }) => primary
    )
    const primaryCountryId =
      primaryCountryLanguage?.country.id ??
      language.countryLanguages[0]?.country.id ??
      'US'

    // Get native name (primary name)
    const nameNative =
      language.name.find(({ primary }) => primary)?.value ??
      language.name[0]?.value ??
      ''

    // Transform language names with bcp47 codes
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

    const result = await client.saveObjects({
      indexName: languagesIndex,
      objects: [transformedLanguage],
      waitForTasks: true
    })

    logger?.info(
      `Successfully saved language to Algolia. Tasks: ${result.map((r: any) => r.taskID).join(', ')}`
    )
    logger?.info(
      `Record ${language.id} is now available in index ${languagesIndex}`
    )
  } catch (error) {
    logger?.error(error, `failed to update language ${languageId} in algolia`)
  }
}
