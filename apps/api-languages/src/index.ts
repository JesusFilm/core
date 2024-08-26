import { createServer } from 'node:http'

import { logger } from './logger'
import { yoga } from './yoga'

import './workers/server'

const port = 4003
// eslint-disable-next-line @typescript-eslint/no-misused-promises
createServer(yoga).listen(port, () => {
  logger.info(
    { module: 'server', port, url: `http://localhost/graphql` },
    'waiting for requests'
  )
})
