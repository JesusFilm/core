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
import './event'
import './journeysEmailPreference'
import './journeyNotification'
import './journeyLanguageAiDetect'
import './journeyVisitor'
import './language'
import './customDomain'
import './host/host'
import './integration'
import './mediaVideo'
import './visitor'
import './qrCode'
import './team'
import './user'
import './userTeam'
import './userTeamInvite'
import './userJourney'
import './userInvite'
import './userRole'
import './plausible'
import './enums'

import { builder } from './builder'

export const schema = builder.toSubGraphSchema({
  linkUrl: 'https://specs.apollo.dev/federation/v2.6'
})
