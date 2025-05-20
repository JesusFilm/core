import { createServer } from 'node:http'

import { logger } from './logger'
import { yoga } from './yoga'

import './workers/server'

// This will help detect schema errors
import './schema'

const port = 4004
// eslint-disable-next-line @typescript-eslint/no-misused-promises
createServer(yoga).listen(port, () => {
  logger.info(
    { module: 'server', port, url: `http://localhost/graphql` },
    'waiting for requests'
  )
})
