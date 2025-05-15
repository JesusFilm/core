import { gql } from '@apollo/client'

import { getApolloClient } from './apolloClient'

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
 * Fetches the default platform for a given API key directly from the API.
 * This version does not use any caching or concurrent request management.
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

  try {
    const { data } = await getApolloClient().query<
      ArclightApiKeyByKeyData,
      GetDefaultPlatformForApiKeyVars
    >({
      query: GET_DEFAULT_PLATFORM_FOR_API_KEY,
      variables: { key: apiKey }
    })

    if (
      data &&
      data.arclightApiKeyByKey &&
      data.arclightApiKeyByKey.defaultPlatform
    ) {
      return data.arclightApiKeyByKey.defaultPlatform
    }
    console.warn(
      `No default platform found for API key: ${apiKey.substring(0, 5)}...`
    )
    return undefined
  } catch (error) {
    console.error(
      `Failed to load default platform for API key ${apiKey.substring(0, 5)}...:`,
      error
    )
    return undefined
  }
}
