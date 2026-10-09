import { readShortLinksEnv } from './lib/env'

import './enums'
import './objects'
import './shortLinkCampaign'
import './shortLinkDomain'
import './shortLink'
import './shortLinkBulkUpdate'
import './shortLinkPublish'
import './shortLinkResolve'
import './shortLinkStats'

// Fail boot on a malformed short-link setting rather than on the first request.
readShortLinksEnv()
