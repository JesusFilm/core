// Developers must add an import for every resolver
// and object type in the schema

import './language'
import './country'
import './continent'
import './countryLanguage'

import './user'

import { builder } from './builder'

export const schema = builder.toSubGraphSchema({
  linkUrl: 'https://specs.apollo.dev/federation/v2.6'
})
