import { randomBytes } from 'node:crypto'
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'

import type { EnvironmentConfig } from '../config/environments'

import { openBrowser } from './openBrowser'

interface LoginResult {
  token: string
  email?: string
  userId?: string
}

interface CallbackBody {
  token?: unknown
  state?: unknown
  email?: unknown
  userId?: unknown
}

const CALLBACK_PATH = '/callback'
const TIMEOUT_MS = 5 * 60 * 1000

const SUCCESS_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>scribe sign-in</title>
    <style>
      body { font-family: system-ui, sans-serif; padding: 2rem; }
      .card { max-width: 420px; margin: 4rem auto; padding: 1.5rem 2rem;
              border: 1px solid #e0e0e0; border-radius: 8px; }
      h1 { margin: 0 0 0.5rem; font-size: 1.25rem; }
      p { color: #555; margin: 0.5rem 0 0; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Signed in to scribe</h1>
      <p>You can close this tab and return to the terminal.</p>
    </div>
  </body>
</html>`

const ERROR_HTML = `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8" /><title>scribe sign-in failed</title></head>
  <body style="font-family: system-ui, sans-serif; padding: 2rem;">
    <h1>Sign-in failed</h1>
    <p>Return to the terminal for details.</p>
  </body>
</html>`

export async function browserLogin(
  env: EnvironmentConfig
): Promise<LoginResult> {
  const state = randomBytes(16).toString('hex')

  return await new Promise<LoginResult>((resolve, reject) => {
    const server = createServer((req, res) => {
      if (req.method === 'OPTIONS') {
        res.writeHead(204, corsHeaders())
        res.end()
        return
      }

      if (req.url == null || !req.url.startsWith(CALLBACK_PATH)) {
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.end('not found')
        return
      }

      if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'text/plain' })
        res.end('method not allowed')
        return
      }

      const chunks: Buffer[] = []
      req.on('data', (chunk: Buffer) => chunks.push(chunk))
      req.on('end', () => {
        try {
          const body = JSON.parse(
            Buffer.concat(chunks).toString('utf8')
          ) as CallbackBody

          if (typeof body.state !== 'string' || body.state !== state) {
            failResponse(res, 'state mismatch')
            reject(new Error('Browser callback state mismatch.'))
            return
          }

          if (typeof body.token !== 'string' || body.token.length === 0) {
            failResponse(res, 'missing token')
            reject(new Error('Browser callback missing token.'))
            return
          }

          res.writeHead(200, {
            ...corsHeaders(),
            'Content-Type': 'text/html; charset=utf-8'
          })
          res.end(SUCCESS_HTML)

          resolve({
            token: body.token,
            email: typeof body.email === 'string' ? body.email : undefined,
            userId: typeof body.userId === 'string' ? body.userId : undefined
          })

          // Close shortly after responding so the success page renders.
          setTimeout(() => server.close(), 100)
        } catch (error) {
          failResponse(res, 'invalid body')
          reject(
            error instanceof Error
              ? error
              : new Error('Browser callback parse failed.')
          )
        }
      })
    })

    server.on('error', reject)

    const timeout = setTimeout(() => {
      server.close()
      reject(new Error(`Sign-in timed out after ${TIMEOUT_MS / 1000}s.`))
    }, TIMEOUT_MS)
    timeout.unref()

    server.listen(0, '127.0.0.1', () => {
      const port = (server.address() as AddressInfo).port
      // Bind to 127.0.0.1 so the listener is reachable only from this host,
      // but advertise the hostname `localhost` so the in-browser fetch from
      // the journeys-admin page is same-origin-friendly and matches the user's
      // preference.
      const callbackUrl = `http://localhost:${port}${CALLBACK_PATH}`
      const target = new URL('/users/cli-auth', env.journeysAdminUrl)
      target.searchParams.set('callback', callbackUrl)
      target.searchParams.set('state', state)
      target.searchParams.set('environment', env.id)

      console.log(`Opening browser for ${env.label} sign-in...`)
      console.log(`  ${target.toString()}`)
      openBrowser(target.toString())
    })
  })
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }
}

function failResponse(
  res: import('node:http').ServerResponse,
  message: string
): void {
  res.writeHead(400, {
    ...corsHeaders(),
    'Content-Type': 'text/html; charset=utf-8'
  })
  res.end(ERROR_HTML.replace('Return to the terminal for details.', message))
}
