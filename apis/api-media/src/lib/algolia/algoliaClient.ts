import { algoliasearch } from 'algoliasearch'
import { Logger } from 'pino'

export async function getAlgoliaClient(
  logger?: Logger
): Promise<ReturnType<typeof algoliasearch> | null> {
  const apiKey = process.env.ALGOLIA_API_KEY ?? ''
  const appId = process.env.ALGOLIA_APPLICATION_ID ?? ''

  if (apiKey === '' || appId === '') {
    logger?.warn('algolia environment variables not set, skipping update')
    return null
  }

  return algoliasearch(appId, apiKey)
}
