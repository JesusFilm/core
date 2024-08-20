// Developers must add an import for every resolver
// and object type in the schema

import './bibleBook'
import './bibleCitation'
import './keyword'
import './language'
import './video'
import './videoVariant'

import { builder } from './builder'

export const schema = builder.toSubGraphSchema({
  linkUrl: 'https://specs.apollo.dev/federation/v2.7'
})
