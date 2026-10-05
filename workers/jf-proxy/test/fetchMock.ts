import { type MockInstance, vi } from 'vitest'

/**
 * Stand-in for the `fetchMock` that `@cloudflare/vitest-pool-workers` used to
 * export from `cloudflare:test`. That export was removed in 0.13 (the release
 * that added Vitest 4 support); Cloudflare now points at stubbing
 * `globalThis.fetch` directly. This keeps the undici MockAgent surface the
 * jf-proxy spec is written against — origin, one-shot interceptors, and the
 * pending-interceptor assertion — on top of a `vi.spyOn(globalThis, 'fetch')`.
 */

interface InterceptOptions {
  path: string
  method?: string
}

interface ReplyOptions {
  headers?: Record<string, string>
}

/** The subset of undici's reply-callback argument the jf-proxy spec reads. */
interface InterceptedRequest {
  headers: Headers
  body: string | undefined
}

interface ReplyCallbackResult {
  statusCode: number
  data?: string
  responseOptions?: ReplyOptions
}

type ReplyCallback = (
  request: InterceptedRequest
) => ReplyCallbackResult | Promise<ReplyCallbackResult>

interface Interceptor {
  origin: string
  path: string
  method: string
  consumed: boolean
  respond: (request: InterceptedRequest) => Promise<Response>
}

interface InterceptorBuilder {
  reply: ((callback: ReplyCallback) => void) &
    ((statusCode: number, data?: string, options?: ReplyOptions) => void)
  replyWithError: (error: Error) => void
}

/**
 * Mirrors undici's `safeUrl`: query params are compared order-insensitively, so
 * an interceptor registered for `?b=2&a=1` still matches a request for
 * `?a=1&b=2`.
 */
function normalizePath(path: string): string {
  const [pathname, ...rest] = path.split('?')
  if (rest.length !== 1) return path
  const params = new URLSearchParams(rest[0])
  params.sort()
  return `${pathname}?${params.toString()}`
}

class FetchMock {
  private readonly interceptors: Interceptor[] = []
  private spy: MockInstance<typeof globalThis.fetch> | undefined

  get(origin: string): {
    intercept: (o: InterceptOptions) => InterceptorBuilder
  } {
    return {
      intercept: (options: InterceptOptions): InterceptorBuilder => {
        const base: Omit<Interceptor, 'respond'> = {
          origin: new URL(origin).origin,
          path: normalizePath(options.path),
          method: (options.method ?? 'GET').toUpperCase(),
          consumed: false
        }

        const register = (
          respond: (request: InterceptedRequest) => Promise<Response>
        ): void => {
          this.interceptors.push({ ...base, respond })
        }

        return {
          reply: (
            statusCodeOrCallback: number | ReplyCallback,
            data?: string,
            replyOptions?: ReplyOptions
          ): void => {
            if (typeof statusCodeOrCallback === 'function') {
              register(async (request) => {
                const result = await statusCodeOrCallback(request)
                return new Response(result.data ?? '', {
                  status: result.statusCode,
                  headers: result.responseOptions?.headers
                })
              })
              return
            }
            register(
              async () =>
                new Response(data ?? '', {
                  status: statusCodeOrCallback,
                  headers: replyOptions?.headers
                })
            )
          },
          replyWithError: (error: Error): void => {
            register(async () => {
              throw error
            })
          }
        }
      }
    }
  }

  /** Installs the `globalThis.fetch` spy. Safe to call more than once. */
  activate(): void {
    if (this.spy != null) return
    this.spy = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async (input, init) => {
        const request = new Request(input, init)
        const url = new URL(request.url)
        const path = normalizePath(`${url.pathname}${url.search}`)

        const interceptor = this.interceptors.find(
          (candidate) =>
            !candidate.consumed &&
            candidate.origin === url.origin &&
            candidate.path === path &&
            candidate.method === request.method.toUpperCase()
        )

        if (interceptor == null) {
          throw new Error(
            `No fetch interceptor matched ${request.method} ${request.url}`
          )
        }

        interceptor.consumed = true
        const body =
          request.method === 'GET' || request.method === 'HEAD'
            ? undefined
            : await request.text()

        return await interceptor.respond({ headers: request.headers, body })
      })
  }

  /** Restores the real `globalThis.fetch`. */
  deactivate(): void {
    this.spy?.mockRestore()
    this.spy = undefined
  }

  /** Throws if any registered interceptor went unused, then clears the queue. */
  assertNoPendingInterceptors(): void {
    const pending = this.interceptors.filter(
      (interceptor) => !interceptor.consumed
    )
    this.interceptors.length = 0
    if (pending.length === 0) return
    const described = pending
      .map(({ method, origin, path }) => `  ${method} ${origin}${path}`)
      .join('\n')
    throw new Error(`Pending interceptors were never used:\n${described}`)
  }
}

export const fetchMock = new FetchMock()
