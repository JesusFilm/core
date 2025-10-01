// Developers must add an import for every resolver
// and object type in the schema

import './cloudflare'
import './segmind'
import './unsplash'
import './bibleBook'
import './bibleCitation'
import './enums'
import './error'
import './keyword'
import './language'
import './mux'
import './playlist'
import './shortLink'
import './user'
import './video'
import './videoSource'
import './videoEdition'
import './videoVariant'
import './tag'
import './taxonomy'
import './youtube'
import './arclightApiKey'

import { builder } from './builder'

export const schema = builder.toSubGraphSchema({
  linkUrl: 'https://specs.apollo.dev/federation/v2.6'
})
