/**
 * Returns true if the error indicates the journey was not found (e.g. missing or
 * filtered out by status such as draft). Used to show 404 instead of 500 when
 * the API returns "journey not found" or 400 (gateway may return 400 for GraphQL errors).
 */
export function isJourneyNotFoundError(error: unknown): boolean {
  if (error == null) return false
  const err = error as {
    message?: string
    graphQLErrors?: Array<{ message?: string }>
    networkError?: {
      statusCode?: number
      result?: { errors?: Array<{ message?: string }> }
    }
  }
  if (err.message === 'journey not found') return true
  const firstGqlMessage = err.graphQLErrors?.[0]?.message
  if (firstGqlMessage === 'journey not found') return true
  const firstNetworkMessage = err.networkError?.result?.errors?.[0]?.message
  if (firstNetworkMessage === 'journey not found') return true
  // Gateway may return 400 when journey is not found (e.g. draft filtered out)
  if (err.networkError?.statusCode === 400) return true
  return false
}
