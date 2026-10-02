import type { Env } from './env'
import { LOCAL_EDGE_API_PREFIX, localEdgeApi } from './localEdgeApi'

import worker from '.'

/**
 * The `wrangler dev` entry (`nx serve short-links-redirect`): the deployed
 * Worker plus the local edge API, so a local api-media can publish into this
 * Worker's local KV. Never deployed: `wrangler.toml` keeps `main` on
 * `src/index.ts` and only the `serve` target names this file.
 */
export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    if (new URL(request.url).pathname.startsWith(LOCAL_EDGE_API_PREFIX))
      return localEdgeApi.fetch(request, env, ctx)
    return worker.fetch(request, env, ctx)
  },
  queue: worker.queue
} satisfies ExportedHandler<Env>
