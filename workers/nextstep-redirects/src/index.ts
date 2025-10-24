import { Hono } from 'hono'

type Env = {
  // no bindings needed for static map
}

const redirectMap: Record<string, string> = {
  // From Slack thread confirmed mappings
  '/Msuwr3Wc': 'https://www.jesusfilm.org/partners/world-languages-quiz/',
  '/o0RLCcG9': 'http://jesusfilm.org/partners/mission-trips/',
  '/6mHO59sg': 'https://your.nextstep.is/jesus-film-tour-delight',
  '/VPqoF2zc':
    'https://drive.google.com/file/d/1IKoqAfwliDrh37vS6MKP8RWo8vRS4x0x/view'
}

const app = new Hono<{ Bindings: Env }>()

app.all('*', async (c) => {
  const url = new URL(c.req.url)
  const path = url.pathname

  const target = redirectMap[path]
  if (target) {
    return Response.redirect(target, 302)
  }

  // Not in list: continue to original URL (origin fetch)
  // Use absolute URL constructed from request URL
  try {
    const upstream = await fetch(url.toString(), {
      method: c.req.method,
      headers: c.req.raw.headers,
      body: ['GET', 'HEAD'].includes(c.req.method)
        ? undefined
        : await c.req.arrayBuffer(),
      redirect: 'manual'
    })

    return new Response(upstream.body, {
      status: upstream.status,
      headers: upstream.headers
    })
  } catch {
    return new Response('Upstream fetch failed', { status: 502 })
  }
})

export default app
