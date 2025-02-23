import { Hono } from 'hono'

const app = new Hono<{ Bindings: { PROXY_DEST?: string } }>()

app.get('*', async (c) => {
  const url = new URL(c.req.url)
  url.hostname = c.env.PROXY_DEST ?? url.hostname
  let response = await fetch(
    url
      .toString()
      .replace(/(%[0-9A-F][0-9A-F])/g, (match) => match.toLowerCase()),
    c.req
  )

  if (response.status == 301 || response.status == 302) {
    const respUrl = new URL(response.headers.get('location') || '')
    const origUrl = new URL(c.req.url)
    if (respUrl.hostname !== origUrl.hostname) {
      respUrl.hostname = origUrl.hostname
      const modifiedResp = new Response(response.body, {
        status: response.status,
        headers: {
          ...response.headers,
          location: respUrl
            .toString()
            .replace(/(%[0-9A-F][0-9A-F])/g, (match) => match.toLowerCase())
        }
      })
      return modifiedResp
    }
  } else if (response.status == 404 || response.status == 500) {
    const notFoundUrl = new URL(c.req.url)
    notFoundUrl.pathname = '/not-found.html'
    response = await fetch(notFoundUrl.toString(), c.req)
  }
  return response
})

export default app
