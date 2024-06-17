import { App, HttpRequest, HttpResponse } from 'uWebSockets.js'

import { yoga } from './yoga'

App()
  .any(
    '/*',
    yoga as (res: HttpResponse, req: HttpRequest) => void | Promise<void>
  )
  .listen(4007, () => {
    console.info('Server is running on http://localhost:4007/graphql')
  })
