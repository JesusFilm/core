// Force the Cloudflare SDK onto its "web" runtime so it uses Node's native
// global fetch — same reason as edge/client.ts. This side-effect import MUST
// run before `cloudflare`.
import 'cloudflare/shims/web'

import Cloudflare from 'cloudflare'

import { envValue } from '../edge/client'
import { failedPrecondition } from '../lib/errors'

export interface InfrastructureConfig {
  accountId: string
  /** the deployed redirect Worker, e.g. `short-links-redirect-stage` */
  workerName: string
  /** the only hostnames this environment may set up, lower-case */
  allowedHostnames: string[]
  client: Cloudflare
}

export const NOT_CONFIGURED_MESSAGE =
  'Cloudflare infrastructure management is not configured in this environment'

let cachedClient: { apiToken: string; client: Cloudflare } | null = null

/**
 * Managing a domain's Cloudflare infrastructure (KV namespace, Worker binding,
 * route / custom domain) is configured by `CLOUDFLARE_SHORT_LINKS_WORKER_NAME`
 * and `CLOUDFLARE_SHORT_LINKS_INFRA_API_TOKEN`. The token is separate from the
 * publishing token because changing a Worker's bindings needs "Workers
 * Scripts: Edit", which the token used on every link save should not carry.
 *
 * Null when either is unset, and in local dev (`..._API_BASE_URL` set): the
 * local redirect Worker emulates publishing only, never provisioning.
 */
export function getInfrastructureConfig(): InfrastructureConfig | null {
  const workerName = envValue('CLOUDFLARE_SHORT_LINKS_WORKER_NAME')
  const apiToken = envValue('CLOUDFLARE_SHORT_LINKS_INFRA_API_TOKEN')
  const accountId = envValue('CLOUDFLARE_ACCOUNT_ID')
  if (workerName == null || apiToken == null || accountId == null) return null
  if (envValue('CLOUDFLARE_SHORT_LINKS_API_BASE_URL') != null) return null

  if (cachedClient == null || cachedClient.apiToken !== apiToken)
    cachedClient = { apiToken, client: new Cloudflare({ apiToken }) }

  return {
    accountId,
    workerName,
    allowedHostnames: (
      envValue('CLOUDFLARE_SHORT_LINKS_ALLOWED_HOSTNAMES') ?? ''
    )
      .split(',')
      .map((hostname) => hostname.trim().toLowerCase())
      .filter((hostname) => hostname !== ''),
    client: cachedClient.client
  }
}

export function requireInfrastructureConfig(): InfrastructureConfig {
  const config = getInfrastructureConfig()
  if (config == null) throw failedPrecondition(NOT_CONFIGURED_MESSAGE)
  return config
}

/**
 * `CLOUDFLARE_SHORT_LINKS_ALLOWED_HOSTNAMES` is the rollout gate: an
 * environment can only set up the hostnames it lists (stage its `stage.*`
 * hostnames, prod the base domains), so a stage superAdmin can never point a
 * production hostname at the stage Worker even though both share a zone. An
 * empty list allows nothing.
 */
export function isHostnameAllowed(
  config: InfrastructureConfig,
  hostname: string
): boolean {
  return config.allowedHostnames.includes(hostname.toLowerCase())
}

export function assertHostnameAllowed(
  config: InfrastructureConfig,
  hostname: string
): void {
  if (isHostnameAllowed(config, hostname)) return
  throw failedPrecondition(
    `${hostname} is not in the hostnames this environment may set up on Cloudflare (CLOUDFLARE_SHORT_LINKS_ALLOWED_HOSTNAMES)`
  )
}
