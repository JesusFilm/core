import { Hono } from 'hono'
import { etag } from 'hono/etag'
import { handle } from 'hono/vercel'

import { mediaComponentLinks } from './_media-component-links'
import { mediaCountries } from './_media-countries'

export const dynamic = 'force-dynamic'

const app = new Hono().basePath('/v2')
app.use(etag())

app.route('/media-component-links', mediaComponentLinks)
app.route('/media-countries', mediaCountries)

export const GET = handle(app)
