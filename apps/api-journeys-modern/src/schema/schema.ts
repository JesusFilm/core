// Developers must add an import for every resolver
// and object type in the schema
import './customDomain'
import './host'
import './integration'
import './journey'
import './journeyCollection'
import './language'
import './tag'
import './team'
import './user'
import './userTeam'

import { builder } from './builder'

export const schema = builder.toSubGraphSchema({
  linkUrl: 'https://specs.apollo.dev/federation/v2.6'
})
