import { Hono } from 'hono'
import { etag } from 'hono/etag'
import { handle } from 'hono/vercel'

import { mediaComponentLinks } from './_media-component-links'
import { mediaComponents } from './_media-components'
import { mediaCountries } from './_media-countries'
import { mediaCountryLinks } from './_media-country-links'
import { mediaLanguages } from './_media-languages'
import { metadataLanguageTags } from './_metadata-language-tags'
import { resources } from './_resources'
import { taxonomies } from './_taxonomies'

export const dynamic = 'force-dynamic'

const app = new Hono().basePath('/v2')
app.use(etag())

app.route('/media-component-links', mediaComponentLinks)
app.route('/media-components', mediaComponents)
app.route('/media-countries', mediaCountries)
app.route('/media-country-links', mediaCountryLinks)
app.route('/media-languages', mediaLanguages)
app.route('/metadata-language-tags', metadataLanguageTags)
app.route('/taxonomies', taxonomies)
app.route('/resources', resources)

export const GET = handle(app)
