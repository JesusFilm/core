import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono } from '@hono/zod-openapi'
import { compress } from 'hono/compress'
import { etag } from 'hono/etag'
import { HTTPException } from 'hono/http-exception'
import { handle } from 'hono/vercel'

import { mediaComponentLinks } from './_media-component-links'
import { mediaComponents } from './_media-components'
import { mediaCountries } from './_media-countries'
import { mediaCountryLinks } from './_media-country-links'
import { mediaLanguages } from './_media-languages'
import { metadataLanguageTags } from './_metadata-language-tags'
import { resources } from './_resources'
import { taxonomies } from './_taxonomies'

const app = new OpenAPIHono().basePath('/v2')

// Apply compression for responses larger than 1KB
app.use(
  '*',
  compress({
    threshold: 1024 // Only compress responses > 1KB
  })
)

app.use(etag())

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json(
      {
        message: err.message,
        logref: err.status
      },
      err.status
    )
  }
  console.error('Unexpected error:', err)
  return c.json(
    {
      message: 'Internal server error',
      logref: 500
    },
    500
  )
})

app.route('/media-component-links', mediaComponentLinks)
app.route('/media-components', mediaComponents)
app.route('/media-countries', mediaCountries)
app.route('/media-country-links', mediaCountryLinks)
app.route('/media-languages', mediaLanguages)
app.route('/metadata-language-tags', metadataLanguageTags)
app.route('/taxonomies', taxonomies)
app.route('/resources', resources)

app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '2.0.0',
    title: 'Arclight API v2',
    description:
      'This documentation is for Arclight API v2. If you are looking for the redirects (/hls, /dl, /dh ) documentation, please visit <a href="/api/redirects-doc">/api/redirects-doc</a>.'
  }
})

app.get('/api/doc', swaggerUI({ url: '/v2/doc' }))

export const GET = handle(app)
