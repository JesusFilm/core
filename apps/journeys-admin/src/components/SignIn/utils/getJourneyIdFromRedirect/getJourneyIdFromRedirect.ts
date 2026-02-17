export function getJourneyIdFromRedirect(
  redirectQuery: string | undefined
): string | undefined {
  if (redirectQuery == null) return undefined
  const redirect = decodeURIComponent(redirectQuery)
  const match = redirect.match(/\/templates\/([^/?]+)/)
  return match?.[1]
}
