import { Hono } from 'hono'
import { etag } from 'hono/etag'
import { handle } from 'hono/vercel'

import { mediaComponentLinks } from './_media-component-links'
import { mediaComponents } from './_media-components'
import { mediaCountries } from './_media-countries'
import { mediaCountryLinks } from './_media-country-links'

export const dynamic = 'force-dynamic'

const app = new Hono().basePath('/v2')
app.use(etag())

app.route('/media-component-links', mediaComponentLinks)
app.route('/media-components', mediaComponents)
app.route('/media-countries', mediaCountries)
app.route('/media-country-links', mediaCountryLinks)

export const GET = handle(app)
