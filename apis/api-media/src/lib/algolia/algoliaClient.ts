import { algoliasearch } from 'algoliasearch'

export type AlgoliaConfig = {
  appId: string
  apiKey: string
  videosIndex: string
  videoVariantsIndex: string
  languagesIndex: string
}

function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (value == null || value === '') {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

/**
 * Reads Algolia configuration from environment variables.
 *
 * NOTE: This is intentionally a function (not a module-level constant) so
 * unit tests that import GraphQL schema modules don't immediately throw
 * when Algolia env vars are not present.
 *
 * The index names are exposed as getters rather than eagerly-evaluated
 * properties: appId/apiKey are shared by every caller so those still resolve
 * up front, but each index's env var is only required at the point a caller
 * actually reads that index. This lets video call sites destructure
 * `videosIndex`/`videoVariantsIndex` without ever requiring
 * ALGOLIA_INDEX_LANGUAGES to be set, and vice versa for language call sites -
 * requiring one index cannot break callers of another.
 */
export function getAlgoliaConfig(): AlgoliaConfig {
  return {
    appId: getRequiredEnv('ALGOLIA_APPLICATION_ID'),
    apiKey: getRequiredEnv('ALGOLIA_API_KEY'),
    get videosIndex(): string {
      return getRequiredEnv('ALGOLIA_INDEX_VIDEOS')
    },
    get videoVariantsIndex(): string {
      return getRequiredEnv('ALGOLIA_INDEX_VIDEO_VARIANTS')
    },
    get languagesIndex(): string {
      return getRequiredEnv('ALGOLIA_INDEX_LANGUAGES')
    }
  }
}

export function getAlgoliaClient(): ReturnType<typeof algoliasearch> {
  const { appId, apiKey } = getAlgoliaConfig()
  return algoliasearch(appId, apiKey)
}
