import { createServer } from 'node:http'

import { logger } from './logger'
import { yoga } from './yoga'

const port = 4006 // Using port 4006 for api-lumina

// eslint-disable-next-line @typescript-eslint/no-misused-promises
createServer(yoga).listen(port, () => {
  logger.info(
    { module: 'server', port, url: `http://localhost:${port}/graphql` },
    'Lumina GraphQL API server started'
  )
})
