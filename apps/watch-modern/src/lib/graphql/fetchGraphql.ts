/**
 * Minimal GraphQL client for watch-modern application.
 * Handles GraphQL requests to the Arclight Gateway API.
 */

export interface GraphQLError {
  message: string
  locations?: Array<{
    line: number
    column: number
  }>
  path?: string[]
  extensions?: Record<string, any>
}

export interface GraphQLResponse<T = any> {
  data: T | null
  errors?: GraphQLError[]
}

/**
 * Fetches data from the GraphQL Gateway API.
 * @param query - The GraphQL query string
 * @param variables - Optional variables for the query
 * @returns Promise resolving to the GraphQL response
 * @throws Error if the request fails or returns errors
 */
export async function fetchGraphql<T = any>(
  query: string,
  variables?: Record<string, any>
): Promise<GraphQLResponse<T>> {
  const endpoint = process.env.NEXT_PUBLIC_GATEWAY_URL

  if (!endpoint) {
    throw new Error('NEXT_PUBLIC_GATEWAY_URL environment variable is not set')
  }

  const response = await fetch(`${endpoint}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-graphql-client-name': 'watch-modern',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  })

  if (!response.ok) {
    throw new Error(
      `GraphQL request failed: ${response.status} ${response.statusText}`
    )
  }

  const result: GraphQLResponse<T> = await response.json()

  // Check for GraphQL errors
  if (result.errors && result.errors.length > 0) {
    console.error('GraphQL errors:', result.errors)
    throw new Error(`GraphQL query failed: ${result.errors[0].message}`)
  }

  return result
}
