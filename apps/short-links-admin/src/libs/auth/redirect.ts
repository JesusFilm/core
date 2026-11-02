export function appendRedirectParam(
  url: string,
  redirectUrl: string | null
): string {
  if (redirectUrl != null) {
    return `${url}?redirect=${redirectUrl}`
  }

  return url
}
