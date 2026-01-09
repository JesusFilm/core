import { algoliasearch } from 'algoliasearch'

function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (value == null || value === '') {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const algoliaConfig = {
  appId: getRequiredEnv('ALGOLIA_APPLICATION_ID'),
  apiKey: getRequiredEnv('ALGOLIA_API_KEY'),
  videosIndex: getRequiredEnv('ALGOLIA_INDEX_VIDEOS'),
  videoVariantsIndex: getRequiredEnv('ALGOLIA_INDEX_VIDEO_VARIANTS')
}

export function getAlgoliaClient(): ReturnType<typeof algoliasearch> {
  return algoliasearch(algoliaConfig.appId, algoliaConfig.apiKey)
}
