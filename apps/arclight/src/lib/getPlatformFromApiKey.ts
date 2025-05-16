import { gql } from '@apollo/client'

import { getApolloClient } from './apolloClient'

const platformCache = new Map<string, string | undefined>()
const ongoingRequests = new Map<string, Promise<string | undefined>>()

const GET_DEFAULT_PLATFORM_FOR_API_KEY = gql`
  query GetDefaultPlatformForApiKey($key: String!) {
    arclightApiKeyByKey(key: $key) {
      defaultPlatform
    }
  }
`

interface ArclightApiKeyByKeyData {
  arclightApiKeyByKey: {
    defaultPlatform: string
  } | null
}

interface GetDefaultPlatformForApiKeyVars {
  key: string
}

/**
 * Fetches the default platform for a given API key.
 * It first checks an in-memory cache. If the platform is not cached,
 * it fetches it from the GraphQL API and then caches it.
 * Handles concurrent requests for the same API key.
 *
 * @param apiKey The API key string.
 * @returns The default platform string (e.g., 'ios', 'android', 'web') or undefined if not found or an error occurs.
 */
export async function getDefaultPlatformForApiKey(
  apiKey?: string
): Promise<string | undefined> {
  if (!apiKey) {
    console.warn('getDefaultPlatformForApiKey called with no API key.')
    return undefined
  }

  if (platformCache.has(apiKey)) {
    return platformCache.get(apiKey)
  }

  if (ongoingRequests.has(apiKey)) {
    return ongoingRequests.get(apiKey)
  }

  const fetchPromise = (async () => {
    try {
      const { data } = await getApolloClient().query<
        ArclightApiKeyByKeyData,
        GetDefaultPlatformForApiKeyVars
      >({
        query: GET_DEFAULT_PLATFORM_FOR_API_KEY,
        variables: { key: apiKey }
      })

      const defaultPlatform = data?.arclightApiKeyByKey?.defaultPlatform

      if (defaultPlatform !== undefined) {
        platformCache.set(apiKey, defaultPlatform)
        return defaultPlatform
      }

      console.warn(`No default platform found for API key: ${apiKey}...`)
      platformCache.set(apiKey, undefined)
      return undefined
    } catch (error) {
      console.error(
        `Failed to load default platform for API key ${apiKey}...:`,
        error
      )
      return undefined
    } finally {
      ongoingRequests.delete(apiKey)
    }
  })()

  ongoingRequests.set(apiKey, fetchPromise)
  return fetchPromise
}
