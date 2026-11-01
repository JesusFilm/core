type FetchStage = 'upstream' | 'fallback'
type ProxyFetch = (
  stage: FetchStage,
  input: Request | string,
  init?: RequestInit
) => Promise<Response>

function fetchWithoutDiagnostics(
  _stage: FetchStage,
  input: Request | string,
  init?: RequestInit
): Promise<Response> {
  return fetch(input, init)
}

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
  if (kind == null) return fetchWithoutDiagnostics

  const rayId = request.headers
    .get('cf-ray')
    ?.match(/^([a-f0-9]{16})(?:-[a-z]{3})?$/i)?.[1]
    .toLowerCase()

  async function fetchWithDiagnostics(
    stage: FetchStage,
    input: Request | string,
    init?: RequestInit
  ): Promise<Response> {
    const startedAt = Date.now()
    function logFetchOutcome(
      outcome: 'started' | 'response' | 'error',
      statusCode?: number,
      railwayId?: string | null
    ): void {
      // Only bounded correlation IDs are allowed; never log URLs or raw headers.
      try {
        console.info(
          JSON.stringify({
            event: 'watch_proxy.fetch',
            request_kind: kind,
            ray_id: rayId,
            stage,
            outcome,
            elapsed_ms: Math.max(0, Date.now() - startedAt),
            status_code: statusCode,
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
    logFetchOutcome('started')
    try {
      const response = await fetch(input, init)
      // Record completion timing and metadata for diagnosis, then return the
      // original response for the proxy to stream. The logger never reads its body.
      logFetchOutcome(
        'response',
        response.status,
        response.headers.get('x-railway-request-id')
      )
      return response
    } catch (error) {
      logFetchOutcome('error')
      throw error
    }
  }

  // Creating the wrapper does not fetch. The caller invokes this function for
  // each upstream/fallback request, which runs the fetch and logging above.
  return fetchWithDiagnostics
}
