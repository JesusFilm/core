import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono } from '@hono/zod-openapi'
import tracer from 'dd-trace'
import { etag } from 'hono/etag'
import { handle } from 'hono/vercel'

import { setCorsHeaders } from '../../lib/redirectUtils'

import { dh } from './_dh'
import { dl } from './_dl'
import { hls } from './_hls'
import { s } from './_s'

export const dynamic = 'force-dynamic'

const app = new OpenAPIHono().basePath('/')
app.use(etag())

// Add Datadog tracing middleware
app.use('*', async (c, next) => {
  const span = tracer.startSpan('arclight.api.request', {
    tags: {
      'http.method': c.req.method,
      'http.url': c.req.url,
      'service.name': 'arclight'
    }
  })

  // Log request details
  console.log(
    JSON.stringify({
      level: 'info',
      method: c.req.method,
      url: c.req.url,
      userAgent: c.req.header('user-agent'),
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      msg: 'API request received',
      // Test correlation - this should be automatically added by next-logger.config.js
      testCorrelation:
        'This log should have dd.trace_id and dd.span_id added automatically'
    })
  )

  try {
    await next()
    span.setTag('http.status_code', c.res.status)

    // Log successful response
    console.log(
      JSON.stringify({
        level: 'info',
        method: c.req.method,
        url: c.req.url,
        statusCode: c.res.status,
        msg: 'API request completed'
      })
    )

    span.finish()
  } catch (error) {
    span.setTag('error', true)
    span.setTag(
      'error.message',
      error instanceof Error ? error.message : String(error)
    )

    // Log error with stack trace
    console.log(
      JSON.stringify({
        level: 'error',
        method: c.req.method,
        url: c.req.url,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        msg: 'API request failed'
      })
    )

    span.finish()
    throw error
  }
})

// Register route modules
app.route('/hls', hls)
app.route('/dl', dl)
app.route('/dh', dh)
app.route('/s', s)

// Documentation
app.doc('/redirects-doc.json', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Arclight API (Redirects)'
  }
})

app.get('/api/redirects-doc', swaggerUI({ url: '/redirects-doc.json' }))

// CORS handling
app.options('*', (c) => {
  setCorsHeaders(c)
  return c.body(null, 204)
})

export const GET = handle(app)
export const OPTIONS = handle(app)
