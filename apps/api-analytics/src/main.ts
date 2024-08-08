import { createServer } from 'node:http'

import { yoga } from './yoga'

const port = 4008
// eslint-disable-next-line @typescript-eslint/no-misused-promises
createServer(yoga).listen(port, () => {
  console.info('Server is running on http://localhost:4008/graphql')
})
