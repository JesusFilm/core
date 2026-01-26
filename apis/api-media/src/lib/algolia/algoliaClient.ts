import { algoliasearch } from 'algoliasearch'

export type AlgoliaConfig = {
  appId: string
  apiKey: string
  videosIndex: string
  videoVariantsIndex: string
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
 */
export function getAlgoliaConfig(): AlgoliaConfig {
  return {
    appId: getRequiredEnv('ALGOLIA_APPLICATION_ID'),
    apiKey: getRequiredEnv('ALGOLIA_API_KEY'),
    videosIndex: getRequiredEnv('ALGOLIA_INDEX_VIDEOS'),
    videoVariantsIndex: getRequiredEnv('ALGOLIA_INDEX_VIDEO_VARIANTS')
  }
}

export function getAlgoliaClient(): ReturnType<typeof algoliasearch> {
  const { appId, apiKey } = getAlgoliaConfig()
  return algoliasearch(appId, apiKey)
}
