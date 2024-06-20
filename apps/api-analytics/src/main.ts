import { createServer } from 'node:http'

import { yoga } from './yoga'

createServer(yoga).listen(4008, () => {
  console.info('Server is running on http://localhost:4008/graphql')
})
