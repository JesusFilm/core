import { Hono } from 'hono'

import type { Env } from './env'
import { buildRedirectEvent } from './event'
import { lostPageResponse } from './lostPage'
import { handleQueueBatch } from './queue'
import { resolve } from './resolve'
import { loadDomain, lookupLink, normaliseHost } from './store'

export type { Env } from './env'

const app = new Hono<{ Bindings: Env }>()

function plainNotFound(): Response {
  return new Response('Not Found', {
    status: 404,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  })
}

function redirectResponse(location: string, status: number): Response {
  return new Response(null, {
    status,
    headers: { Location: location, 'Cache-Control': 'no-store' }
  })
}

// Never slugs: well-known probes and the files every browser asks for.
// Hono dispatches HEAD through the GET handlers and strips the body.
app.get('/.well-known/*', () => plainNotFound())
app.get('/favicon.ico', () => plainNotFound())
app.get('/robots.txt', () => plainNotFound())

app.get('*', async (c) => {
  const url = new URL(c.req.url)
  const host = normaliseHost(url.host)

  const domain = await loadDomain(c.env, c.executionCtx, host)
  if (domain == null) return lostPageResponse()

  const resolution = await resolve({
    domain,
    pathname: url.pathname,
    search: url.search,
    lookup: (_key, _hostname, pathname) =>
      lookupLink(c.env, c.executionCtx, domain, pathname)
  })

  if (resolution.kind === 'lostPage') return lostPageResponse()

  if (resolution.kind === 'passthrough') {
    return redirectResponse(resolution.location, 302)
  }

  const response = redirectResponse(resolution.location, resolution.status)

  const { record, pathname, resolvedFrom } = resolution
  if (record == null || pathname == null || resolvedFrom == null) {
    return response
  }

  try {
    const cf = c.req.raw.cf as IncomingRequestCfProperties | undefined
    const event = buildRedirectEvent({
      hostname: domain.hostname,
      pathname,
      record,
      destination: resolution.location,
      status: resolution.status,
      resolvedFrom,
      searchParams: url.searchParams,
      headers: c.req.raw.headers,
      country: typeof cf?.country === 'string' ? cf.country : null
    })
    c.executionCtx.waitUntil(
      c.env.SHORT_LINKS_EVENTS.send(event).catch((error: unknown) => {
        console.error(JSON.stringify({ event: 'queue_send_failed' }), error)
      })
    )
  } catch (error) {
    console.error(JSON.stringify({ event: 'queue_send_failed' }), error)
  }

  return response
})

app.all('*', () => {
  return new Response('Method Not Allowed', {
    status: 405,
    headers: { Allow: 'GET, HEAD', 'Cache-Control': 'no-store' }
  })
})

export { app }

export default {
  fetch: app.fetch,
  queue: handleQueueBatch
} satisfies ExportedHandler<Env>
