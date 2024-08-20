import { createServer } from 'node:http'

import { yoga } from './yoga'

// eslint-disable-next-line @typescript-eslint/no-misused-promises
createServer(yoga).listen(4008, () => {
  console.info('Server is running on http://localhost:4008/graphql')
})
