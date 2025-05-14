import { OpenAPIHono } from '@hono/zod-openapi'

import { mediaComponentLinks } from './_media-component-links'
import { mediaComponents } from './_media-components'
import { mediaCountries } from './_media-countries'
import { mediaCountryLinks } from './_media-country-links'
import { mediaLanguages } from './_media-languages'
import { metadataLanguageTags } from './_metadata-language-tags'
import { resources } from './_resources'
import { taxonomies } from './_taxonomies'

const v2App = new OpenAPIHono()

v2App.route('/media-component-links', mediaComponentLinks)
v2App.route('/media-components', mediaComponents)
v2App.route('/media-countries', mediaCountries)
v2App.route('/media-country-links', mediaCountryLinks)
v2App.route('/media-languages', mediaLanguages)
v2App.route('/metadata-language-tags', metadataLanguageTags)
v2App.route('/taxonomies', taxonomies)
v2App.route('/resources', resources)

export { v2App }
