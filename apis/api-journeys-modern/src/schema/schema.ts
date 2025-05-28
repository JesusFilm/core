// Developers must add an import for every resolver
// and object type in the schema

import './block' // Import blocks module
import './journey'
import './journeyAiTranslate'
import './mediaVideo'
import './journeyEventsExportLog'
import './journeyLanguageAiDetect'

import { builder } from './builder'

export const schema = builder.toSubGraphSchema({
  linkUrl: 'https://specs.apollo.dev/federation/v2.6'
})
