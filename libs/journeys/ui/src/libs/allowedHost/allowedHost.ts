const DEFAULT_TESTS = [
  process.env.NEXT_PUBLIC_VERCEL_URL,
  /.*-jesusfilm\.vercel\.app/
]

export function allowedHost(
  host: string,
  tests?: Array<string | RegExp | undefined>
): boolean {
  const allowedHosts = [...DEFAULT_TESTS, ...(tests ?? [])]
  return allowedHosts.some((value) => {
    if (value == null) return false
    if (typeof value === 'string') return value === host
    return value.test(host)
  })
}
