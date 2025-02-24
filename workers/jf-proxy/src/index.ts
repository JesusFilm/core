import { Hono } from 'hono'

const app = new Hono<{ Bindings: { PROXY_DEST?: string } }>()

app.get('*', async (c) => {
  const url = new URL(c.req.url)
  url.hostname = c.env.PROXY_DEST ?? url.hostname
  let response: Response

  try {
    response = await fetch(
      url
        .toString()
        .replace(/(%[0-9A-F][0-9A-F])/g, (match) => match.toLowerCase()),
      c.req
    )
  } catch (error) {
    console.error('Proxy fetch error:', error)
    return new Response('Service Unavailable', { status: 503 })
  }

  if (response.status == 301 || response.status == 302) {
    const locationHeader = response.headers.get('location')
    if (!locationHeader) {
      // If no location header, pass through the response as-is
      return response
    }

    try {
      const respUrl = new URL(locationHeader)
      const origUrl = new URL(c.req.url)
      if (respUrl.hostname !== origUrl.hostname) {
        respUrl.hostname = origUrl.hostname
        const modifiedResp = new Response(response.body, {
          status: response.status,
          headers: {
            ...Object.fromEntries(response.headers.entries()),
            location: respUrl
              .toString()
              .replace(/(%[0-9A-F][0-9A-F])/g, (match) => match.toLowerCase())
          }
        })
        return modifiedResp
      }
    } catch (error) {
      // If location URL is invalid, pass through the response as-is
      console.warn('Invalid redirect location:', locationHeader)
      return response
    }
  } else if (response.status == 404 || response.status == 500) {
    const notFoundUrl = new URL(c.req.url)
    notFoundUrl.pathname = '/not-found.html'
    try {
      response = await fetch(notFoundUrl.toString(), c.req)
    } catch (error) {
      console.error('Not found page fetch error:', error)
      return new Response('Not Found', { status: 404 })
    }
  }

  // Sanitize response headers
  const sanitizedHeaders = Object.fromEntries(
    Array.from(response.headers.entries()).filter(
      ([_, value]) => value !== undefined && value !== null
    )
  )

  return new Response(response.body, {
    status: response.status,
    headers: sanitizedHeaders
  })
})

export default app
