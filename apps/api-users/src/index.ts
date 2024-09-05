import { createServer } from 'node:http'

import { yoga } from './yoga'
import './workers/server'

const port = 4002
// eslint-disable-next-line @typescript-eslint/no-misused-promises
createServer(yoga).listen(port, () => {
  console.info(`Server is running on http://localhost:${port}/graphql`)
})
