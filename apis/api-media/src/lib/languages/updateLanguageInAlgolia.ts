import { type SearchClient, algoliasearch } from 'algoliasearch'
import type { Logger } from 'pino'

import {
  Prisma,
  prisma as languagesPrisma
} from '@core/prisma/languages/client'

function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (value == null || value.trim() === '') {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

interface AlgoliaLanguagesClient {
  client: SearchClient
  languagesIndex: string
}

function getAlgoliaLanguagesClient(): AlgoliaLanguagesClient {
  const appId = getRequiredEnv('ALGOLIA_APPLICATION_ID')
  const apiKey = getRequiredEnv('ALGOLIA_API_KEY')
  const languagesIndex = getRequiredEnv('ALGOLIA_INDEX_LANGUAGES')

  return { client: algoliasearch(appId, apiKey), languagesIndex }
}

const languageAlgoliaSelect = {
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
} satisfies Prisma.LanguageSelect

type AlgoliaLanguage = Prisma.LanguageGetPayload<{
  select: typeof languageAlgoliaSelect
}>

interface AlgoliaLanguageRecord {
  // Index signature keeps the record assignable to Algolia's
  // saveObjects `Record<string, unknown>` object type.
  [key: string]: unknown
  objectID: string
  languageId: string
  bcp47: string | null
  iso3: string | null
  nameNative: string
  speakersCount: number
  primaryCountryId: string
  names: Array<{ value: string; languageId: string; bcp47: string }>
}

export function buildAlgoliaLanguageRecord(
  language: AlgoliaLanguage
): AlgoliaLanguageRecord {
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

  return {
    objectID: language.id,
    languageId: language.id,
    bcp47: language.bcp47,
    iso3: language.iso3,
    nameNative,
    speakersCount,
    primaryCountryId,
    names
  }
}

export async function updateLanguageInAlgoliaFromMedia(
  languageId: string,
  logger?: Logger
): Promise<void> {
  const { client, languagesIndex } = getAlgoliaLanguagesClient()

  try {
    const language = await languagesPrisma.language.findUnique({
      where: { id: languageId },
      select: languageAlgoliaSelect
    })

    if (language == null) {
      logger?.warn(`language ${languageId} not found`)
      return
    }

    await client.saveObjects({
      indexName: languagesIndex,
      objects: [buildAlgoliaLanguageRecord(language)],
      waitForTasks: true
    })
  } catch (error) {
    logger?.error(error, `failed to update language ${languageId} in algolia`)
  }
}

const REINDEX_BATCH_SIZE = 1000

interface ReindexLanguagesResult {
  count: number
}

/**
 * Pushes every language that has videos into the Algolia languages index.
 *
 * The incremental sync only fires on a hasVideos false -> true transition, so
 * languages that were already marked hasVideos: true (the schema default) never
 * reach Algolia and are missing from search. This repairs the index by
 * re-upserting all of them in batches.
 */
export async function reindexLanguagesWithVideosInAlgolia(
  logger?: Logger
): Promise<ReindexLanguagesResult> {
  const { client, languagesIndex } = getAlgoliaLanguagesClient()

  let count = 0
  let cursor: string | undefined

  for (;;) {
    const languages = await languagesPrisma.language.findMany({
      where: { hasVideos: true },
      select: languageAlgoliaSelect,
      orderBy: { id: 'asc' },
      take: REINDEX_BATCH_SIZE,
      ...(cursor != null ? { skip: 1, cursor: { id: cursor } } : {})
    })

    if (languages.length === 0) break

    await client.saveObjects({
      indexName: languagesIndex,
      objects: languages.map(buildAlgoliaLanguageRecord),
      waitForTasks: false
    })

    count += languages.length
    cursor = languages[languages.length - 1].id
    logger?.info(`reindexed ${count} languages in algolia`)

    if (languages.length < REINDEX_BATCH_SIZE) break
  }

  return { count }
}
