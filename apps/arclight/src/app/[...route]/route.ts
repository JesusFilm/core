import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono } from '@hono/zod-openapi'
import { etag } from 'hono/etag'
import { handle } from 'hono/vercel'

import { setCorsHeaders } from '../_redirectUtils'

import { dh } from './_dh'
import { dl } from './_dl'
import { hls } from './_hls'
import { s } from './_s'

export const dynamic = 'force-dynamic'

const app = new OpenAPIHono().basePath('/')
app.use(etag())

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
