// Developers must add an import for every resolver
// and object type in the schema

import './action'
import './block'
import './enums'
import './event'
import './journey'
import './journeyAiTranslate'
import './journeyEventsExportLog'
import './journeyLanguageAiDetect'
import './language'
import './mediaVideo'

import { builder } from './builder'

export const schema = builder.toSubGraphSchema({
  linkUrl: 'https://specs.apollo.dev/federation/v2.6'
})
