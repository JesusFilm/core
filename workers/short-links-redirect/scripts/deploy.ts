/**
 * Deploys the Worker without dropping the bindings api-media manages.
 *
 *   tsx scripts/deploy.ts --env=stage|prod
 *
 * Authenticates with `CLOUDFLARE_API_TOKEN` (CI) or, without one, the session
 * of `wrangler login`. With access to more than one account, set
 * `CLOUDFLARE_ACCOUNT_ID`.
 *
 * 1. Reads the bindings of the live Worker from the Cloudflare API.
 * 2. Writes `wrangler.deploy.toml` (gitignored, next to `wrangler.toml` so
 *    relative paths still resolve): `wrangler.toml` plus every live `KV_*`
 *    binding it does not declare.
 * 3. Runs `wrangler deploy` against that file.
 *
 * Fails closed: when the live bindings cannot be read for any reason other
 * than "this Worker has never been deployed", nothing is deployed, because
 * deploying blind would silently unbind every short-link domain.
 */
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { unstable_readConfig } from 'wrangler'

import {
  type LiveBinding,
  bindingsToCarryOver,
  renderDeployConfig
} from './deployConfig'

const API = 'https://api.cloudflare.com/client/v4'
// "workers.api.error.script_not_found" / "service_not_found": what wrangler
// itself treats as "the Worker does not exist yet"
const WORKER_NOT_FOUND_CODES = [10007, 10090]

const workerDirectory = path.resolve(__dirname, '..')
const sourceConfigPath = path.join(workerDirectory, 'wrangler.toml')
const deployConfigPath = path.join(workerDirectory, 'wrangler.deploy.toml')

interface CloudflareEnvelope<Result> {
  success: boolean
  errors: Array<{ code: number; message: string }>
  result: Result
}

class CloudflareApiError extends Error {
  constructor(
    readonly status: number,
    readonly codes: number[],
    message: string
  ) {
    super(message)
  }
}

/** The slice of wrangler's resolved config this script reads. */
interface WranglerConfig {
  name?: string
  account_id?: string
  kv_namespaces: Array<{ binding: string }>
}

function readWranglerConfig(
  configPath: string,
  environment?: string
): WranglerConfig {
  return unstable_readConfig(
    { config: configPath, env: environment },
    { hideWarnings: true }
  )
}

function fail(message: string): never {
  console.error(`deploy: ${message}`)
  process.exit(1)
}

/**
 * CI passes `CLOUDFLARE_API_TOKEN`. A developer signed in with
 * `wrangler login` has no API token, so fall back to wrangler's own session.
 */
function resolveApiToken(): string {
  const fromEnvironment = process.env.CLOUDFLARE_API_TOKEN
  if (fromEnvironment != null && fromEnvironment !== '') return fromEnvironment

  const { status, stdout } = spawnSync('wrangler', ['auth', 'token'], {
    cwd: workerDirectory,
    encoding: 'utf8'
  })
  const token = status === 0 ? stdout.trim().split('\n').pop()?.trim() : ''
  if (token == null || token === '')
    fail(
      'CLOUDFLARE_API_TOKEN is not set and wrangler is not signed in (run `wrangler login`)'
    )
  return token
}

async function cloudflare<Result>(
  apiToken: string,
  apiPath: string
): Promise<Result> {
  const response = await fetch(`${API}${apiPath}`, {
    headers: { Authorization: `Bearer ${apiToken}` }
  })
  const envelope: CloudflareEnvelope<Result> = await response.json()
  if (!response.ok || !envelope.success)
    throw new CloudflareApiError(
      response.status,
      envelope.errors.map(({ code }) => code),
      `${apiPath}: ${response.status} ${envelope.errors.map(({ code, message }) => `${message} (${code})`).join('; ')}`
    )
  return envelope.result
}

/** The same resolution wrangler uses: config, then env, then the token's single account. */
async function resolveAccountId(
  apiToken: string,
  configured: string | undefined
): Promise<string> {
  const accountId = configured ?? process.env.CLOUDFLARE_ACCOUNT_ID
  if (accountId != null && accountId !== '') return accountId

  const memberships = await cloudflare<Array<{ account: { id: string } }>>(
    apiToken,
    '/memberships'
  )
  if (memberships.length !== 1)
    fail(
      `the API token can see ${memberships.length} accounts; set CLOUDFLARE_ACCOUNT_ID`
    )
  return memberships[0].account.id
}

async function liveBindings(
  apiToken: string,
  accountId: string,
  workerName: string
): Promise<LiveBinding[]> {
  try {
    const settings = await cloudflare<{ bindings?: LiveBinding[] }>(
      apiToken,
      `/accounts/${accountId}/workers/scripts/${encodeURIComponent(workerName)}/settings`
    )
    return settings.bindings ?? []
  } catch (error) {
    const neverDeployed =
      error instanceof CloudflareApiError &&
      error.status === 404 &&
      error.codes.some((code) => WORKER_NOT_FOUND_CODES.includes(code))
    if (neverDeployed) {
      console.log(`deploy: ${workerName} is not deployed yet; first deploy`)
      return []
    }
    throw error
  }
}

async function main(): Promise<void> {
  const environment = process.argv
    .find((argument) => argument.startsWith('--env='))
    ?.slice('--env='.length)
  if (environment == null || environment === '')
    fail('usage: tsx scripts/deploy.ts --env=<stage|prod>')

  const apiToken = resolveApiToken()

  const config = readWranglerConfig(sourceConfigPath, environment)
  const workerName = config.name
  if (workerName == null) fail(`no Worker name for env "${environment}"`)
  const declared = config.kv_namespaces.map(({ binding }) => binding)
  // declared at the top level (dev) only: left out of the deployed config
  const devOnly = readWranglerConfig(sourceConfigPath)
    .kv_namespaces.map(({ binding }) => binding)
    .filter((binding) => !declared.includes(binding))

  const accountId = await resolveAccountId(apiToken, config.account_id)
  const carried = bindingsToCarryOver(
    declared,
    await liveBindings(apiToken, accountId, workerName)
  )
  console.log(
    carried.length === 0
      ? `deploy: no API-managed KV bindings to carry over on ${workerName}`
      : `deploy: carrying over ${carried.map(({ binding }) => binding).join(', ')} on ${workerName}`
  )

  writeFileSync(
    deployConfigPath,
    renderDeployConfig(
      readFileSync(sourceConfigPath, 'utf8'),
      environment,
      carried,
      devOnly
    )
  )

  // read the generated file back through wrangler's own parser: a carried
  // binding that did not make it into the config must stop the deploy
  const generated = readWranglerConfig(
    deployConfigPath,
    environment
  ).kv_namespaces.map(({ binding }) => binding)
  const expected = [...declared, ...carried.map(({ binding }) => binding)]
  if (
    generated.length !== expected.length ||
    expected.some((binding) => !generated.includes(binding))
  )
    fail(
      `generated config declares [${generated.join(', ')}], expected [${expected.join(', ')}]`
    )

  const { status } = spawnSync(
    'wrangler',
    ['deploy', `--env=${environment}`, '--config', deployConfigPath],
    { cwd: workerDirectory, stdio: 'inherit' }
  )
  process.exit(status ?? 1)
}

main().catch((error: unknown) => {
  fail(
    `could not read the live Worker, so nothing was deployed: ${error instanceof Error ? error.message : String(error)}`
  )
})
