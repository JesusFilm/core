// Developers must add an import for every resolver
// and object type in the schema

import './action' // Import action module
import './block' // Import blocks module
import './journey'
import './journeyAiTranslate'
import './journeyEventsExportLog'
import './journeyProfile'
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
// import './visitor' // Temporarily disabled due to compilation issues

import { builder } from './builder'

export const schema = builder.toSubGraphSchema({
  linkUrl: 'https://specs.apollo.dev/federation/v2.6'
})
