import { createServer } from 'node:http'

import { env } from './env'
import { logger } from './logger'
import { warnOnInvalidJourneysUrl } from './warnOnInvalidJourneysUrl'
import { yoga } from './yoga'

import './workers/server'

warnOnInvalidJourneysUrl(env.JOURNEYS_URL, logger)

const port = 4004
// eslint-disable-next-line @typescript-eslint/no-misused-promises
createServer(yoga).listen(port, () => {
  logger.info(
    { module: 'server', port, url: `http://localhost/graphql` },
    'waiting for requests'
  )
})
