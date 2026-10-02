import { prisma } from '@core/prisma/media/client'

import { builder } from '../../builder'
import { NotFoundError } from '../../error'

import { withCloudflareErrors } from './errors'
import {
  attachDomain,
  detachDomain,
  removeDomainKv,
  setupDomainKv
} from './operations'
import {
  DomainInfrastructure,
  InfrastructureCheck,
  getDomainInfrastructure
} from './status'

const ShortLinkDomainInfrastructureState = builder.enumType(
  'ShortLinkDomainInfrastructureState',
  {
    values: {
      ok: { description: 'in place and as this domain expects' },
      missing: { description: 'not set up yet' },
      mismatch: {
        description: 'exists, but not as this domain expects (see detail)'
      },
      error: { description: 'Cloudflare could not be asked (see detail)' },
      unknown: {
        description:
          'not checked: management is not configured here, or an earlier check has to pass first'
      }
    } as const
  }
)

const ShortLinkDomainInfrastructureCheckRef = builder
  .objectRef<InfrastructureCheck>('ShortLinkDomainInfrastructureCheck')
  .implement({
    fields: (t) => ({
      state: t.field({
        type: ShortLinkDomainInfrastructureState,
        nullable: false,
        resolve: ({ state }) => state
      }),
      detail: t.exposeString('detail', {
        nullable: false,
        description: 'what was found, in words a superAdmin can act on'
      })
    })
  })

const ShortLinkDomainInfrastructureRef = builder
  .objectRef<DomainInfrastructure>('ShortLinkDomainInfrastructure')
  .implement({
    description:
      'live state of a short link domain on Cloudflare, read from the Cloudflare API on every request',
    fields: (t) => ({
      configured: t.exposeBoolean('configured', {
        nullable: false,
        description:
          'false when this environment cannot manage Cloudflare infrastructure (local dev, or the Worker name / token is unset)'
      }),
      workerName: t.exposeString('workerName', {
        nullable: true,
        description: 'the redirect Worker this environment manages'
      }),
      hostnameAllowed: t.exposeBoolean('hostnameAllowed', {
        nullable: false,
        description:
          'whether this environment may set this hostname up (CLOUDFLARE_SHORT_LINKS_ALLOWED_HOSTNAMES)'
      }),
      zone: t.field({
        type: ShortLinkDomainInfrastructureCheckRef,
        nullable: false,
        description: 'the Cloudflare zone the hostname belongs to',
        resolve: ({ zone }) => zone
      }),
      kvNamespace: t.field({
        type: ShortLinkDomainInfrastructureCheckRef,
        nullable: false,
        description: 'the KV namespace holding this domain routing records',
        resolve: ({ kvNamespace }) => kvNamespace
      }),
      kvBinding: t.field({
        type: ShortLinkDomainInfrastructureCheckRef,
        nullable: false,
        description: 'the binding the Worker reads that namespace through',
        resolve: ({ kvBinding }) => kvBinding
      }),
      attachment: t.field({
        type: ShortLinkDomainInfrastructureCheckRef,
        nullable: false,
        description:
          'the route (path prefix) or custom domain (root) sending the hostname to the Worker',
        resolve: ({ attachment }) => attachment
      })
    })
  })

builder.prismaObjectField('ShortLinkDomain', 'infrastructure', (t) =>
  t.field({
    type: ShortLinkDomainInfrastructureRef,
    nullable: false,
    authScopes: { isSuperAdmin: true },
    description:
      'Cloudflare infrastructure of this domain (superAdmin only; several Cloudflare API calls, so never select it in a list)',
    select: {
      hostname: true,
      pathPrefix: true,
      kvNamespaceId: true,
      kvBinding: true
    },
    resolve: async (domain) => await getDomainInfrastructure(domain)
  })
)

const superAdminScopes = { isSuperAdmin: true } as const

builder.mutationFields((t) => {
  const operation = (
    description: string,
    run: (domainId: string) => Promise<void>
  ) =>
    t.withAuth(superAdminScopes).prismaField({
      type: 'ShortLinkDomain',
      description,
      errors: { types: [NotFoundError] },
      nullable: false,
      args: { id: t.arg.string({ required: true }) },
      resolve: async (query, _, { id }) => {
        await withCloudflareErrors(async () => await run(id))
        return await prisma.shortLinkDomain.findUniqueOrThrow({
          ...query,
          where: { id }
        })
      }
    })

  return {
    shortLinkDomainKvSetup: operation(
      'create or adopt the KV namespace of a domain, publish its links into it and bind it to the redirect Worker (superAdmin only; safe to repeat)',
      setupDomainKv
    ),
    shortLinkDomainKvRemove: operation(
      'remove the Worker binding of a domain and clear its KV setup; the namespace is left in Cloudflare (superAdmin only; refused while the hostname is attached)',
      removeDomainKv
    ),
    shortLinkDomainWorkerAttach: operation(
      'send the hostname to the redirect Worker: a route for a domain with a path prefix, a custom domain otherwise (superAdmin only; refused when it points at another Worker)',
      attachDomain
    ),
    shortLinkDomainWorkerDetach: operation(
      'remove the route or custom domain sending the hostname to the redirect Worker (superAdmin only)',
      detachDomain
    )
  }
})
