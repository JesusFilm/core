import { App, HttpRequest, HttpResponse } from 'uWebSockets.js'

import { yoga } from './yoga'

App()
  .any(
    '/*',
    yoga as (res: HttpResponse, req: HttpRequest) => void | Promise<void>
  )
  .listen(4008, () => {
    console.info('Server is running on http://localhost:4008/graphql')
  })
