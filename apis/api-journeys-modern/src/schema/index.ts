import './builder'
import './schema'

// Import schema modules
import './journeyAiTranslate'
import './journeyEventsExportLog'
import './mediaVideo'
import './userNotifications'
import './journey'

import { generate } from './generate'

export * from './builder'

export { schema } from './schema'

if (
  (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') ||
  process.env.GENERATE_SCHEMA === 'true'
) {
  generate()
  if (process.env.GENERATE_SCHEMA === 'true') process.exit(0)
}
