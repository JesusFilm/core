import { createServer } from 'node:http'

import { logger } from './logger'
import { yoga } from './yoga'

const port = 4004 // Using port 4004 for api-lumina

// eslint-disable-next-line @typescript-eslint/no-misused-promises
createServer(yoga).listen(port, () => {
  logger.info(
    { module: 'server', port, url: `http://localhost:${port}/graphql` },
    'Lumina GraphQL API server started'
  )
})
