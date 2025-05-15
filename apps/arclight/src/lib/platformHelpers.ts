import { gql } from '@apollo/client'

import { getApolloClient } from './apolloClient'

interface ApiKeyPlatform {
  key: string
  defaultPlatform: string
}

let apiKeyToDefaultPlatform: Map<string, string> | null = null
let isLoadingApiKeys = false
let loadPromise: Promise<void> | null = null

const GET_API_KEYS_AND_PLATFORMS = gql`
  query GetArclightApiKeysAndPlatforms {
    arclightApiKeys {
      key
      defaultPlatform
    }
  }
`

/**
 * Fetches API keys and their default platforms from the GraphQL API
 * and populates an in-memory map.
 * Should be called once during application initialization.
 */
export async function loadApiKeysAndPlatforms(): Promise<void> {
  if (apiKeyToDefaultPlatform !== null) {
    return Promise.resolve()
  }

  if (isLoadingApiKeys && loadPromise) {
    return loadPromise
  }

  isLoadingApiKeys = true
  loadPromise = (async () => {
    try {
      const { data } = await getApolloClient().query<
        { arclightApiKeys: ApiKeyPlatform[] },
        never // No variables for this query
      >({
        query: GET_API_KEYS_AND_PLATFORMS
      })

      const tempMap = new Map<string, string>() // Use a temporary map
      if (data && data.arclightApiKeys) {
        for (const item of data.arclightApiKeys) {
          tempMap.set(item.key, item.defaultPlatform)
        }
      }
      apiKeyToDefaultPlatform = tempMap // Assign to module-level map only on success
      console.log('API keys and platforms loaded successfully.')
    } catch (error) {
      console.error('Failed to load API keys and platforms:', error)
      apiKeyToDefaultPlatform = null // On error, reset the map to allow retries
    } finally {
      isLoadingApiKeys = false
      loadPromise = null
    }
  })()
  return loadPromise
}

/**
 * Gets the default platform for a given API key.
 * Relies on `loadApiKeysAndPlatforms` being called beforehand, typically at app startup.
 * @param apiKey The API key string.
 * @returns The default platform string (e.g., 'ios', 'android', 'web') or undefined if not found or not loaded.
 */
export function getPlatformForApiKey(apiKey?: string): string | undefined {
  if (!apiKey) {
    return undefined
  }
  if (apiKeyToDefaultPlatform === null) {
    console.warn(
      'getPlatformForApiKey called before API keys were loaded. Call loadApiKeysAndPlatforms() at app startup.'
    )
    // Optionally, trigger a load here if desired, though typically done at startup
    // loadApiKeysAndPlatforms(); // This would make getPlatformForApiKey async or require a different pattern
    return undefined
  }
  return apiKeyToDefaultPlatform.get(apiKey)
}
