// Developers must add an import for every resolver
// and object type in the schema

import './action' // Import action module
import './block' // Import blocks module
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
import './language'
import './mediaVideo'
// import './qrCode' // Temporarily disabled due to ShortLink federation issue
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
