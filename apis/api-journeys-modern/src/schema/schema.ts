// Developers must add an import for every resolver
// and object type in the schema

import './mediaVideo'
import './journeyEventsExportLog'

import { builder } from './builder'

export const schema = builder.toSubGraphSchema({
  linkUrl: 'https://specs.apollo.dev/federation/v2.6'
})
