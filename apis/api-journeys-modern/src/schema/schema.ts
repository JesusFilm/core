// Developers must add an import for every resolver
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
import './journeyLanguageAiDetect'
import './journeyNotification'
import './journeyProfile'
import './journeysEmailPreference'
import './journeyTheme'
import './journeyVisitor'
import './language'
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
