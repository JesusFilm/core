// Developers must add an import for every resolver
// and object type in the schema

import './action'
import './block'
import './chatButton'
import './journey'
import './journeyAiTranslate'
import './journeyCollection'
import './journeyEventsExportLog'
import './journeyProfile'
import './journeyTheme'
import './journeyEvent'
// import './event/event' // Temporarily disabled - type issues
import './journeysEmailPreference'
import './journeyNotification'
import './journeyLanguageAiDetect'
import './language'
import './customDomain'
import './host'
import './integration'
import './mediaVideo'
import './qrCode'
import './team'
import './userJourney'
import './userTeam'
import './userTeamInvite'
import './userInvite'
import './userRole'
import './visitor'

import { builder } from './builder'

export const schema = builder.toSubGraphSchema({
  linkUrl: 'https://specs.apollo.dev/federation/v2.6'
})
