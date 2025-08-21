// Here we export all the types from our schema
// Make sure to import them by their index files rather than directly into the schema.ts file
// as imports in schema.ts will be placed into the schema.json and schema.graphql, rather than the types
// and object type in the schema

import './action'
import './block'
import './chatButton'
import './customDomain'
import './event'
import './host'
import './integration'
import './journey'
import './journeyAiTranslate'
import './journeyCollection'
import './journeyEventsExportLog'
import './journeyProfile'
import './journeyTheme'
import './journeyEvent'
import './journeysEmailPreference'
import './journeyNotification'
import './journeyLanguageAiDetect'
import './journeyVisitor'
import './language'
import './host/host'
import './mediaVideo'
import './plausible'
import './qrCode'
import './team'
import './user'
import './userInvite'
import './userJourney'
import './userRole'
import './userTeam'
import './userTeamInvite'
import './visitor'

import { builder } from './builder'

export const schema = builder.toSubGraphSchema({
  linkUrl: 'https://specs.apollo.dev/federation/v2.6'
})
