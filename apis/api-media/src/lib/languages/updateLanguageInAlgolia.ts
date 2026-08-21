import type { Logger } from 'pino'

import {
  Prisma,
  prisma as languagesPrisma
} from '@core/prisma/languages/client'

import { getAlgoliaClient, getAlgoliaConfig } from '../algolia/algoliaClient'

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
    // number` type arclight declares for hits in _resources/index.ts (arclight
    // itself reads Number(hit.objectID), not this field). Prisma types
    // Language.id as a String, so it needs coercing here. Language ids are
    // numeric strings by convention; a non-numeric id would serialise as
    // `languageId: null`.
    languageId: Number(language.id),
    bcp47: language.bcp47,
    iso3: language.iso3,
    nameNative,
    speakersCount,
    primaryCountryId,
    names
  }
}

/** A language is publicly visible when it has video content. */
export const publiclyVisibleLanguageWhere = {
  hasVideos: true
} satisfies Prisma.LanguageWhereInput

export async function updateLanguageInAlgoliaFromMedia(
  languageId: string,
  logger?: Logger
): Promise<void> {
  try {
    const client = getAlgoliaClient()
    const { languagesIndex } = getAlgoliaConfig()
    const language = await languagesPrisma.language.findUnique({
      where: { id: languageId },
      select: { ...languageAlgoliaSelect, hasVideos: true }
    })

    // A language that is gone or has no content has to be removed rather than
    // skipped. The sync is otherwise upsert-only, so anything indexed while it
    // was visible would stay in search forever after being turned off.
    if (language == null || !language.hasVideos) {
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
  const client = getAlgoliaClient()
  const { languagesIndex } = getAlgoliaConfig()

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
