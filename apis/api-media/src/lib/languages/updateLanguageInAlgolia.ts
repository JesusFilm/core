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

// Deliberately local rather than reusing lib/algolia/algoliaClient, whose
// getAlgoliaConfig also requires the video index env vars. Coupling the
// languages sync to those would break video indexing wherever they are unset.
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

// A type alias (not an interface) so it keeps an implicit index signature and
// stays assignable to Algolia's `Record<string, unknown>` object type.
type AlgoliaLanguageRecord = {
  objectID: string
  languageId: number
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
    // Numeric to match every other record in the index and the `languageId:
    // number` contract arclight declares in _resources/index.ts. Prisma types
    // Language.id as a String, so it needs coercing here. Every id in the index
    // is a numeric string, and arclight already relies on that via
    // `Number(hit.objectID)`, so this cannot produce NaN in practice.
    languageId: Number(language.id),
    bcp47: language.bcp47,
    iso3: language.iso3,
    nameNative,
    speakersCount,
    primaryCountryId,
    names
  }
}

/**
 * A language is publicly visible only when it has content *and* an operator has
 * not hidden it. `hasVideos` is derived and written automatically; `searchable`
 * is operator-owned and nothing automated may write it.
 */
function isPubliclyVisible(language: {
  hasVideos: boolean
  searchable: boolean
}): boolean {
  return language.hasVideos && language.searchable
}

export const publiclyVisibleLanguageWhere = {
  hasVideos: true,
  searchable: true
} satisfies Prisma.LanguageWhereInput

export async function updateLanguageInAlgoliaFromMedia(
  languageId: string,
  logger?: Logger
): Promise<void> {
  try {
    const { client, languagesIndex } = getAlgoliaLanguagesClient()
    const language = await languagesPrisma.language.findUnique({
      where: { id: languageId },
      select: { ...languageAlgoliaSelect, hasVideos: true, searchable: true }
    })

    // A language that is gone, has no content, or has been hidden by an
    // operator has to be removed rather than skipped. The sync is otherwise
    // upsert-only, so anything indexed while it was visible would stay
    // searchable forever after being turned off.
    if (language == null || !isPubliclyVisible(language)) {
      logger?.info(
        `removing language ${languageId} from algolia (${language == null ? 'not found' : 'not publicly visible'})`
      )
      await client.deleteObject({
        indexName: languagesIndex,
        objectID: languageId
      })
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
 * Pushes every publicly visible language into the Algolia languages index.
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
      where: publiclyVisibleLanguageWhere,
      select: languageAlgoliaSelect,
      orderBy: { id: 'asc' },
      take: REINDEX_BATCH_SIZE,
      ...(cursor != null ? { skip: 1, cursor: { id: cursor } } : {})
    })

    if (languages.length === 0) break

    await client.saveObjects({
      indexName: languagesIndex,
      objects: languages.map(buildAlgoliaLanguageRecord),
      waitForTasks: true
    })

    count += languages.length
    cursor = languages[languages.length - 1].id
    logger?.info(`reindexed ${count} languages in algolia`)

    if (languages.length < REINDEX_BATCH_SIZE) break
  }

  return { count }
}

interface RemoveLanguagesResult {
  removed: number
}

/**
 * Removes the given languages from the Algolia languages index.
 *
 * Deleting an objectID that is not in the index is a no-op, so callers can pass
 * every candidate rather than first working out which are actually indexed --
 * the api-media Algolia key cannot browse, so that check is not available.
 */
export async function removeLanguagesFromAlgolia(
  languageIds: string[],
  logger?: Logger
): Promise<RemoveLanguagesResult> {
  if (languageIds.length === 0) return { removed: 0 }

  const { client, languagesIndex } = getAlgoliaLanguagesClient()

  for (let i = 0; i < languageIds.length; i += REINDEX_BATCH_SIZE) {
    const batch = languageIds.slice(i, i + REINDEX_BATCH_SIZE)

    await client.deleteObjects({
      indexName: languagesIndex,
      objectIDs: batch,
      waitForTasks: true
    })

    logger?.info(
      `removed ${Math.min(i + REINDEX_BATCH_SIZE, languageIds.length)} of ${languageIds.length} languages from algolia`
    )
  }

  return { removed: languageIds.length }
}
