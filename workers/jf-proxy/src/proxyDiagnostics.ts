type FetchStage = 'upstream' | 'fallback'
type ProxyFetch = (
  stage: FetchStage,
  input: Request | string,
  init?: RequestInit
) => Promise<Response>

function requestKind(request: Request): 'document' | 'rsc' | 'prefetch' | null {
  const pathname = new URL(request.url).pathname
  if (
    request.method !== 'GET' ||
    !/^\/watch(?:\/|$)/.test(pathname) ||
    /^\/watch\/(?:_next|api)(?:\/|$)/.test(pathname)
  ) {
    return null
  }

  const accept = request.headers.get('accept') ?? ''
  if (
    request.headers.get('rsc') === '1' ||
    accept.includes('text/x-component')
  ) {
    return request.headers.get('next-router-prefetch') === '1'
      ? 'prefetch'
      : 'rsc'
  }
  return accept.includes('text/html') ? 'document' : null
}

/** Observe fetch-to-headers boundaries without changing proxy or stream behavior. */
export function createWatchProxyFetch(request: Request): ProxyFetch {
  const kind = requestKind(request)
  if (kind == null) return (_stage, input, init) => fetch(input, init)

  const rayId = request.headers
    .get('cf-ray')
    ?.match(/^([a-f0-9]{16})(?:-[a-z]{3})?$/i)?.[1]
    .toLowerCase()

  return async (stage, input, init) => {
    const startedAt = Date.now()
    const log = (
      outcome: 'started' | 'response' | 'error',
      response?: Response
    ): void => {
      // Only bounded correlation IDs are allowed; never log URLs or raw headers.
      const railwayId = response?.headers.get('x-railway-request-id')
      try {
        console.info(
          JSON.stringify({
            event: 'watch_proxy.fetch',
            request_kind: kind,
            ray_id: rayId,
            stage,
            outcome,
            elapsed_ms: Math.max(0, Date.now() - startedAt),
            status_code: response?.status,
            railway_request_id:
              railwayId != null && /^[a-z0-9_-]{1,64}$/i.test(railwayId)
                ? railwayId
                : undefined
          })
        )
      } catch {
        // A logging failure must not change the proxied response.
      }
    }

    // Completion-only logs cannot identify the stage of a canceled invocation.
    log('started')
    try {
      const response = await fetch(input, init)
      log('response', response)
      return response
    } catch (error) {
      log('error')
      throw error
    }
  }
}
