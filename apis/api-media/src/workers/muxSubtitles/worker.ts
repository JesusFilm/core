import { createServer } from 'node:http'
import { URL } from 'node:url'
import { config } from 'dotenv'
import { join } from 'node:path'

import { logger } from '../lib/logger'

import { getMuxSubtitlesWorkflowBundle } from './workflowBundle'
import { registerMuxSubtitleSteps } from './steps'
import { dynamicImport } from '../../lib/dynamicImport'

// Load environment variables
config({ path: join(process.cwd(), 'apis/api-media/.env') })

const port = Number(process.env.MUX_SUBTITLES_WORKER_PORT ?? 4015)

async function toRequest(
  req: import('node:http').IncomingMessage
): Promise<Request> {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)
  const method = req.method ?? 'GET'
  const headers = new Headers()

  for (const [key, value] of Object.entries(req.headers)) {
    if (value == null) continue
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item)
    } else {
      headers.set(key, value)
    }
  }

  const body =
    method === 'GET' || method === 'HEAD' ? undefined : (req as any)

  const requestInit = {
    method,
    headers,
    body,
    duplex: 'half'
  } as RequestInit & { duplex: 'half' }

  return new Request(url.toString(), requestInit)
}

async function sendResponse(
  res: import('node:http').ServerResponse,
  response: Response
): Promise<void> {
  res.statusCode = response.status
  response.headers.forEach((value, key) => {
    res.setHeader(key, value)
  })

  const buffer = Buffer.from(await response.arrayBuffer())
  res.end(buffer)
}

async function main(): Promise<void> {
  await registerMuxSubtitleSteps()

  const { workflowEntrypoint, stepEntrypoint } = await dynamicImport(
    'workflow/runtime'
  )

  const workflowHandler = workflowEntrypoint(getMuxSubtitlesWorkflowBundle())

  const server = createServer(async (req, res) => {
    try {
      const request = await toRequest(req)
      const pathname = new URL(request.url).pathname

      if (pathname === '/.well-known/workflow/v1/flow') {
        const response = await workflowHandler(request)
        await sendResponse(res, response)
        return
      }

      if (pathname === '/.well-known/workflow/v1/step') {
        const response = await stepEntrypoint(request)
        await sendResponse(res, response)
        return
      }

      res.statusCode = 404
      res.end('Not Found')
    } catch (error) {
      logger.error({ error }, 'muxSubtitles worker error')
      res.statusCode = 500
      res.end('Internal Server Error')
    }
  })

  server.listen(port, () => {
    logger.info(
      { module: 'muxSubtitles', port },
      'muxSubtitles worker listening'
    )
  })
}

if (process.env.NODE_ENV !== 'test') {
  void main()
}
