import { ShortLinkDomain } from '@core/prisma/media/client'

import { Attachment, listAttachments, matchesTarget } from './attachments'
import {
  InfrastructureConfig,
  NOT_CONFIGURED_MESSAGE,
  getInfrastructureConfig,
  isHostnameAllowed
} from './config'
import { cloudflareErrorMessage } from './errors'
import { AttachmentTarget, attachmentTarget } from './names'
import { getNamespace } from './namespaces'
import { getWorkerBindings } from './workerBindings'
import { Zone, findZone } from './zones'

export type InfrastructureState =
  | 'ok'
  | 'missing'
  | 'mismatch'
  | 'error'
  | 'unknown'

export interface InfrastructureCheck {
  state: InfrastructureState
  detail: string
}

export interface DomainInfrastructure {
  configured: boolean
  workerName: string | null
  hostnameAllowed: boolean
  zone: InfrastructureCheck
  kvNamespace: InfrastructureCheck
  kvBinding: InfrastructureCheck
  attachment: InfrastructureCheck
}

export type DomainForInfrastructure = Pick<
  ShortLinkDomain,
  'hostname' | 'pathPrefix' | 'kvNamespaceId' | 'kvBinding'
>

function check(
  state: InfrastructureState,
  detail: string
): InfrastructureCheck {
  return { state, detail }
}

/** One Cloudflare failure must not hide the checks that did succeed. */
async function guarded(
  run: () => Promise<InfrastructureCheck>
): Promise<InfrastructureCheck> {
  try {
    return await run()
  } catch (error) {
    return check('error', `Cloudflare: ${cloudflareErrorMessage(error)}`)
  }
}

async function checkNamespace(
  config: InfrastructureConfig,
  domain: DomainForInfrastructure
): Promise<InfrastructureCheck> {
  if (domain.kvNamespaceId == null)
    return check('missing', 'No KV namespace has been set up for this domain')
  const namespace = await getNamespace(config, domain.kvNamespaceId)
  if (namespace == null)
    return check(
      'mismatch',
      `The saved namespace ${domain.kvNamespaceId} no longer exists in Cloudflare`
    )
  return check('ok', `${namespace.title} (${namespace.id})`)
}

async function checkBinding(
  config: InfrastructureConfig,
  domain: DomainForInfrastructure
): Promise<InfrastructureCheck> {
  if (domain.kvBinding == null)
    return check('missing', 'No Worker binding has been set up for this domain')
  const bindings = await getWorkerBindings(config)
  const binding = bindings.find(({ name }) => name === domain.kvBinding)
  if (binding == null)
    return check(
      'missing',
      `${config.workerName} has no ${domain.kvBinding} binding (a Worker deploy can drop it; set up KV again)`
    )
  if (
    binding.type !== 'kv_namespace' ||
    binding.namespace_id !== domain.kvNamespaceId
  )
    return check(
      'mismatch',
      `${domain.kvBinding} on ${config.workerName} points at ${binding.namespace_id ?? `a ${binding.type} binding`}, not this domain's namespace`
    )
  return check('ok', `${domain.kvBinding} on ${config.workerName}`)
}

/** How the hostname is attached, judged against what the domain expects. */
export function describeAttachment(
  workerName: string,
  target: AttachmentTarget,
  attachments: Attachment[]
): InfrastructureCheck {
  const expected = attachments.find((attachment) =>
    matchesTarget(attachment, target)
  )
  if (expected?.script === workerName)
    return check('ok', `${target.pattern} → ${workerName}`)
  if (expected != null)
    return check(
      'mismatch',
      `${target.pattern} is attached to ${expected.script ?? 'no Worker'}, not ${workerName}`
    )

  const other = attachments.find(({ script }) => script === workerName)
  if (other != null)
    return check(
      'mismatch',
      `${workerName} is attached as ${other.pattern}, but this domain expects ${target.pattern}`
    )
  return check('missing', `${target.pattern} is not attached to ${workerName}`)
}

/**
 * Live state of a domain's Cloudflare infrastructure, read from Cloudflare on
 * every call (about five API requests): nothing here is stored.
 */
export async function getDomainInfrastructure(
  domain: DomainForInfrastructure
): Promise<DomainInfrastructure> {
  const config = getInfrastructureConfig()
  if (config == null) {
    const unknown = check('unknown', NOT_CONFIGURED_MESSAGE)
    return {
      configured: false,
      workerName: null,
      hostnameAllowed: false,
      zone: unknown,
      kvNamespace: unknown,
      kvBinding: unknown,
      attachment: unknown
    }
  }

  const target = attachmentTarget(domain)
  let zone: Zone | null = null
  const zoneCheck = await guarded(async () => {
    zone = await findZone(config, domain.hostname)
    return zone == null
      ? check(
          'missing',
          `No zone for ${domain.hostname} in this Cloudflare account`
        )
      : check('ok', zone.name)
  })

  const [kvNamespace, kvBinding, attachment] = await Promise.all([
    guarded(async () => await checkNamespace(config, domain)),
    guarded(async () => await checkBinding(config, domain)),
    guarded(async () => {
      if (zone == null)
        return check('unknown', 'Needs the zone to be found first')
      return describeAttachment(
        config.workerName,
        target,
        await listAttachments(config, zone, target.hostname)
      )
    })
  ])

  return {
    configured: true,
    workerName: config.workerName,
    hostnameAllowed: isHostnameAllowed(config, domain.hostname),
    zone: zoneCheck,
    kvNamespace,
    kvBinding,
    attachment
  }
}
