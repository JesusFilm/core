import { createServer } from 'node:http'
import { join } from 'node:path'
import { URL } from 'node:url'

import { config } from 'dotenv'

import { dynamicImport } from '../../lib/dynamicImport'
import { logger } from '../lib/logger'

import { registerAiSubtitlePostProcessorSteps } from './steps'
import { getAiSubtitlePostProcessorWorkflowBundle } from './workflowBundle'

config({ path: join(process.cwd(), 'apis/api-media/.env') })

const port = Number(process.env.AI_SUBTITLE_POST_PROCESSOR_WORKER_PORT ?? 4016)

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

  const body = method === 'GET' || method === 'HEAD' ? undefined : (req as any)

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
  await registerAiSubtitlePostProcessorSteps()

  const { workflowEntrypoint, stepEntrypoint } = await dynamicImport(
    'workflow/runtime'
  )

  const workflowHandler = workflowEntrypoint(
    getAiSubtitlePostProcessorWorkflowBundle()
  )

  const server = createServer((req, res) => {
    void handleRequest(req, res, workflowHandler, stepEntrypoint)
  })

  server.listen(port, () => {
    logger.info(
      { module: 'aiSubtitlePostProcessor', port },
      'aiSubtitlePostProcessor worker listening'
    )
  })
}

if (process.env.NODE_ENV !== 'test') {
  void main()
}

async function handleRequest(
  req: import('node:http').IncomingMessage,
  res: import('node:http').ServerResponse,
  workflowHandler: (request: Request) => Promise<Response>,
  stepEntrypoint: (request: Request) => Promise<Response>
): Promise<void> {
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
    logger.error({ error }, 'aiSubtitlePostProcessor worker error')
    res.statusCode = 500
    res.end('Internal Server Error')
  }
}
