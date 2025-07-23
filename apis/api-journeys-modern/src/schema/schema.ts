// Here we export all the types from our schema
// Make sure to import them by their index files rather than directly into the schema.ts file
// as imports in schema.ts will be placed into the schema.json and schema.graphql, rather than the types
// and object type in the schema

import './action'
import './block'
import './chatButton/chatButton'
import './journey'
import './journeyAiTranslate'
import './journeyCollection'
import './journeyEventsExportLog'
import './journeyProfile'
import './journeyTheme'
import './journeyEvent'
import './event'
import './journeysEmailPreference'
import './journeyNotification'
import './journeyLanguageAiDetect'
import './language'
import './customDomain/customDomain'
import './host/host'
import './integration/integration'
import './mediaVideo'
import './visitor'
import './visitor/types'
import './visitor/enums'
import './qrCode'
import './team'
import './user'
import './userTeam'
import './userTeamInvite'
import './userJourney'
import './userInvite/userInvite'
import './userRole/userRole'
import './plausible/plausible'
import './enums'

import { builder } from './builder'

export const schema = builder.toSubGraphSchema({
  linkUrl: 'https://specs.apollo.dev/federation/v2.6'
})
