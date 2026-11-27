import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import { z } from 'zod'

const status = z
  .object({
    controls: z
      .array(
        z
          .object({
            control: z.enum(['admission', 'effects']),
            enabled: z.boolean(),
            generation: z.number().int().nonnegative()
          })
          .strict()
      )
      .length(2),
    accepted: z.array(
      z
        .object({
          executor: z.enum(['journeys', 'mcp', 'media']),
          stage: z.enum([
            'read',
            'output',
            'media_admit',
            'media_transfer',
            'media_dispatch',
            'media_cancel',
            'media_release'
          ]),
          _count: z.object({ _all: z.number().int().nonnegative() }).strict()
        })
        .strict()
    ),
    pendingChanges: z.number().int().nonnegative()
  })
  .strict()

export async function operate(
  args,
  env = process.env,
  send = fetch,
  write = console.log
) {
  try {
    const url = new URL(env.AUTH_ISSUER)
    if (
      (url.protocol !== 'https:' &&
        !(
          url.protocol === 'http:' &&
          ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
        )) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname !== '/' ||
      (env.AUTH_OPERATIONS_SECRET?.length ?? 0) < 32
    )
      throw new Error('Configuration')
    let body
    if (args.length === 1 && args[0] === 'status') body = { action: 'status' }
    else if (
      args.length === 4 &&
      args[0] === 'set' &&
      ['admission', 'effects'].includes(args[1]) &&
      ['true', 'false'].includes(args[2]) &&
      /^\d+$/.test(args[3]) &&
      Number(args[3]) <= 2147483646
    )
      body = {
        action: 'set',
        control: args[1],
        enabled: args[2] === 'true',
        expectedGeneration: Number(args[3])
      }
    else throw new Error('Arguments')
    const response = await send(new URL('/internal/operations', url), {
      method: 'POST',
      redirect: 'error',
      signal: AbortSignal.timeout(10000),
      headers: {
        Authorization: `Bearer ${env.AUTH_OPERATIONS_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    if (!response.ok) throw new Error('Control refused')
    write(JSON.stringify(status.parse(await response.json()), null, 2))
    return 0
  } catch {
    write(
      'Operational control failed. Refresh status and verify the operator configuration; no settlement or cancellation is implied.'
    )
    return 1
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
)
  process.exitCode = await operate(process.argv.slice(2))
