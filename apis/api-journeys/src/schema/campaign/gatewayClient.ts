import { GraphQLError } from 'graphql'

/**
 * Lookups against other subgraphs through the gateway, in the shape of the QR
 * service's request helper. Mocked per spec; never called inside a transaction.
 */
async function graphqlRequest(
  query: string,
  variables: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const gatewayUrl = process.env.GATEWAY_URL
  if (gatewayUrl == null)
    throw new GraphQLError('Gateway URL not configured', {
      extensions: { code: 'INTERNAL_SERVER_ERROR' }
    })

  const response = await fetch(gatewayUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'interop-token': process.env.INTEROP_TOKEN ?? '',
      'x-graphql-client-name': 'api-journeys-modern',
      'x-graphql-client-version': process.env.SERVICE_VERSION ?? ''
    },
    body: JSON.stringify({ query, variables })
  })

  const result = (await response.json()) as {
    data?: Record<string, unknown>
    errors?: Array<{ message: string }>
  }

  if (result.errors != null && result.errors.length > 0)
    throw new GraphQLError(result.errors[0].message, {
      extensions: { code: 'INTERNAL_SERVER_ERROR' }
    })

  return result.data ?? {}
}

export interface GatewayLanguage {
  id: string
  bcp47: string | null
}

/** Resolve an api-languages Language by id; `null` when it does not exist. */
export async function fetchLanguage(
  id: string
): Promise<GatewayLanguage | null> {
  const query = `
    query CampaignLanguage($id: ID!) {
      language(id: $id) {
        id
        bcp47
      }
    }
  `
  const data = await graphqlRequest(query, { id })
  const language = data.language as GatewayLanguage | null | undefined
  return language ?? null
}

/**
 * The English name of an api-languages Language, for machine-translation
 * prompts; `null` when the language does not exist.
 */
export async function fetchLanguageName(id: string): Promise<string | null> {
  const query = `
    query CampaignLanguageName($id: ID!) {
      language(id: $id) {
        id
        name(languageId: "529") {
          value
          primary
        }
      }
    }
  `
  const data = await graphqlRequest(query, { id })
  const language = data.language as
    | { name: Array<{ value: string; primary: boolean }> }
    | null
    | undefined
  if (language == null) return null
  const names = language.name
  return (names.find((name) => !name.primary) ?? names[0])?.value ?? null
}
