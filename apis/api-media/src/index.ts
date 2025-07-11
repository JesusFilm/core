import { createServer } from 'node:http'

import { logger } from './logger'
import { initializeQueue } from './schema/cloudflare/r2/transcode'
import { yoga } from './yoga'

import './workers/server'
import './workers/processVideoDownloads/worker'

const port = 4005
// eslint-disable-next-line @typescript-eslint/no-misused-promises
createServer(yoga).listen(port, () => {
  logger.info(
    { module: 'server', port, url: `http://localhost/graphql` },
    'waiting for requests'
  )
  initializeQueue()
})
