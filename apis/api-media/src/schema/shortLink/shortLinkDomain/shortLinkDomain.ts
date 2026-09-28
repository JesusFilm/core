import { ZodError } from 'zod'

import { Prisma, ShortLinkDomain, prisma } from '@core/prisma/media/client'

import { builder } from '../../builder'
import { Service } from '../../enums/service'
import {
  ForeignKeyConstraintError,
  NotFoundError,
  NotUniqueError
} from '../../error'
import { publishDomain, publishDomainWithLinks, unpublishDomain } from '../edge'
import { ShortLinkNotFound } from '../enums/shortLinkNotFound'
import {
  HTTPS_URL_MESSAGE,
  REDIRECT_STATUS_MESSAGE,
  inputValidationError,
  isHttpsUrl,
  isRedirectStatus
} from '../lib/errors'
import {
  PATH_PREFIX_MESSAGE,
  isValidPathPrefix,
  normalizePathPrefix
} from '../lib/shortUrl'
import { isValidSlugAllowedChars } from '../lib/slug'

import { ShortLinkDomainCheckRef } from './objects/shortLinkDomainCheck'
import {
  addVercelDomain,
  checkVercelDomain,
  removeVercelDomain
} from './shortLinkDomain.service'

// admin = shortLinkAdmin or publisher
const adminScopes = {
  $any: { isPublisher: true, isShortLinkAdmin: true }
} as const

const SLUG_ALLOWED_CHARS_MESSAGE =
  'slugAllowedChars must be a valid regex character-class body (e.g. A-Za-z0-9_-)'
// the edge Worker never looks up paths longer than this
const SLUG_MAX_LENGTH_LIMIT = 64

builder.prismaObject('ShortLinkDomain', {
  description: 'A domain that can be used for short links',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    hostname: t.exposeString('hostname', { nullable: false }),
    apexName: t.exposeString('apexName', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'Date', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'Date', nullable: false }),
    services: t.expose('services', {
      type: [Service],
      nullable: false,
      description:
        'The services that are enabled for this domain, if empty then this domain can be used by all services'
    }),
    check: t.field({
      type: ShortLinkDomainCheckRef,
      authScopes: { isPublisher: true },
      nullable: false,
      description: 'check status of the domain',
      resolve: async ({ hostname }) => await checkVercelDomain(hostname)
    }),
    pathPrefix: t.exposeString('pathPrefix', {
      nullable: false,
      description:
        'path the short links live under, without leading or trailing slashes (e.g. s); empty means the root of the hostname'
    }),
    redirectStatus: t.exposeInt('redirectStatus', {
      nullable: false,
      description:
        'HTTP status the edge redirects with (301, 302, 307, 308) unless a link overrides it'
    }),
    slugAllowedChars: t.exposeString('slugAllowedChars', {
      nullable: false,
      description:
        'regex character-class body describing the characters a pathname may use'
    }),
    slugMinLength: t.exposeInt('slugMinLength', { nullable: false }),
    slugMaxLength: t.exposeInt('slugMaxLength', { nullable: false }),
    slugCaseSensitive: t.exposeBoolean('slugCaseSensitive', {
      nullable: false,
      description:
        'when false, pathnames are lower-cased on create and matched case-insensitively at the edge'
    }),
    reservedPaths: t.exposeStringList('reservedPaths', {
      nullable: false,
      description: 'first path segments that are never minted as short links'
    }),
    fallbackTo: t.exposeString('fallbackTo', {
      nullable: true,
      description:
        'where unresolved traffic goes when notFound is fallback, and where paused links go unless they override it'
    }),
    notFound: t.expose('notFound', {
      type: ShortLinkNotFound,
      nullable: false
    }),
    passthroughOrigin: t.exposeString('passthroughOrigin', {
      nullable: true,
      description:
        'origin that receives unresolved requests with their path and query intact when notFound is passthrough'
    }),
    autoFailover: t.exposeBoolean('autoFailover', {
      nullable: false,
      description:
        'when true, a failing destination health check pauses the link (never for videoEmbedded)'
    }),
    edgePublishedAt: t.expose('edgePublishedAt', {
      type: 'DateTime',
      nullable: true,
      description: 'when the domain record was last written to the edge store'
    }),
    linkCount: t.relationCount('shortLinks', {
      nullable: false,
      description: 'live (not soft-deleted) links on this domain',
      where: { deletedAt: null }
    })
  })
})

builder.queryFields((t) => ({
  shortLinkDomains: t.withAuth({ isAuthenticated: true }).prismaConnection({
    type: 'ShortLinkDomain',
    cursor: 'id',
    description: 'List of short link domains that can be used for short links',
    nullable: false,
    args: {
      service: t.arg({
        type: Service,
        required: false,
        description:
          'Filter by service (including domains with no services set)'
      })
    },
    resolve: async (query, _, { service }) =>
      await prisma.shortLinkDomain.findMany({
        ...query,
        where:
          service != null
            ? {
                OR: [
                  { services: { hasEvery: [service] } },
                  { services: { isEmpty: true } }
                ]
              }
            : undefined,
        orderBy: {
          hostname: 'asc'
        }
      }),
    totalCount: async (query, { service }) =>
      await prisma.shortLinkDomain.count({
        ...query,
        where:
          service != null
            ? {
                OR: [
                  { services: { hasEvery: [service] } },
                  { services: { isEmpty: true } }
                ]
              }
            : undefined
      })
  }),
  shortLinkDomain: t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'ShortLinkDomain',
    description: 'Find a short link domain by id',
    errors: {
      types: [NotFoundError]
    },
    nullable: false,
    args: {
      id: t.arg.string({ required: true })
    },
    resolve: async (query, _, { id }) => {
      try {
        const domain = await prisma.shortLinkDomain.findFirstOrThrow({
          ...query,
          where: { id }
        })
        const check = await checkVercelDomain(domain.hostname)
        return { ...domain, check }
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2025'
        )
          throw new NotFoundError('short link domain not found', [
            {
              path: ['id'],
              value: id
            }
          ])
        throw e
      }
    }
  })
}))

type DomainSettings = Pick<
  ShortLinkDomain,
  'notFound' | 'passthroughOrigin' | 'slugMinLength' | 'slugMaxLength'
>

/** Cross-field rules that need the merged (existing + input) settings. */
function assertDomainSettings(settings: DomainSettings): void {
  if (settings.notFound === 'passthrough' && settings.passthroughOrigin == null)
    throw inputValidationError(
      ['input', 'passthroughOrigin'],
      'passthroughOrigin is required when notFound is passthrough'
    )
  if (settings.slugMinLength > settings.slugMaxLength)
    throw inputValidationError(
      ['input', 'slugMinLength'],
      'slugMinLength must not exceed slugMaxLength'
    )
}

/** '/s/' -> 's'; undefined when the input leaves the prefix untouched. */
function resolvePathPrefix(
  pathPrefix: string | null | undefined
): string | undefined {
  if (pathPrefix == null) return undefined
  const normalized = normalizePathPrefix(pathPrefix)
  if (!isValidPathPrefix(normalized))
    throw inputValidationError(['input', 'pathPrefix'], PATH_PREFIX_MESSAGE)
  return normalized
}

/** Fields whose change alters the routing records of every link on the domain. */
const ROUTING_FIELDS = [
  'redirectStatus',
  'fallbackTo',
  'passthroughOrigin',
  'slugCaseSensitive'
] as const

function routingChanged(
  before: ShortLinkDomain,
  after: ShortLinkDomain
): boolean {
  return ROUTING_FIELDS.some((field) => before[field] !== after[field])
}

builder.mutationFields((t) => ({
  shortLinkDomainCreate: t.withAuth(adminScopes).prismaFieldWithInput({
    type: 'ShortLinkDomain',
    description:
      'Create a new short link domain that can be used for short links (this domain must have a CNAME record pointing to the short link service)',
    errors: {
      types: [ZodError, NotUniqueError]
    },
    nullable: false,
    input: {
      hostname: t.input.string({
        required: true,
        description:
          'the hostname including subdomain, domain, and TLD, but excluding port',
        validate: [
          (value) => {
            try {
              return new URL(`https://${value}`).hostname === value
            } catch {
              return false
            }
          },
          'hostname must be valid'
        ]
      }),
      services: t.input.field({
        type: [Service],
        required: false,
        description:
          'the services that are enabled for this domain, if empty then this domain can be used by all services'
      }),
      pathPrefix: t.input.string({
        required: false,
        description:
          'path the short links live under, without leading or trailing slashes (e.g. s); defaults to empty (root of the hostname)'
      }),
      redirectStatus: t.input.int({
        required: false,
        description: 'defaults to 307',
        validate: {
          refine: [isRedirectStatus, { message: REDIRECT_STATUS_MESSAGE }]
        }
      }),
      slugAllowedChars: t.input.string({
        required: false,
        description: 'defaults to A-Za-z0-9_-',
        validate: {
          refine: [
            isValidSlugAllowedChars,
            { message: SLUG_ALLOWED_CHARS_MESSAGE }
          ]
        }
      }),
      slugMinLength: t.input.int({
        required: false,
        description: 'defaults to 1',
        validate: { min: 1, max: SLUG_MAX_LENGTH_LIMIT }
      }),
      slugMaxLength: t.input.int({
        required: false,
        description: 'defaults to 64',
        validate: { min: 1, max: SLUG_MAX_LENGTH_LIMIT }
      }),
      slugCaseSensitive: t.input.boolean({
        required: false,
        description: 'defaults to true'
      }),
      reservedPaths: t.input.stringList({ required: false }),
      fallbackTo: t.input.string({
        required: false,
        validate: { refine: [isHttpsUrl, { message: HTTPS_URL_MESSAGE }] }
      }),
      notFound: t.input.field({
        type: ShortLinkNotFound,
        required: false,
        description: 'defaults to lostPage'
      }),
      passthroughOrigin: t.input.string({
        required: false,
        description: 'required when notFound is passthrough',
        validate: { refine: [isHttpsUrl, { message: HTTPS_URL_MESSAGE }] }
      }),
      autoFailover: t.input.boolean({
        required: false,
        description: 'defaults to false'
      })
    },
    resolve: async (query, _, { input }) => {
      const { hostname, services } = input
      const pathPrefix = resolvePathPrefix(input.pathPrefix)
      assertDomainSettings({
        notFound: input.notFound ?? 'lostPage',
        passthroughOrigin: input.passthroughOrigin ?? null,
        slugMinLength: input.slugMinLength ?? 1,
        slugMaxLength: input.slugMaxLength ?? SLUG_MAX_LENGTH_LIMIT
      })

      return await prisma.$transaction(async (tx) => {
        try {
          const { apexName } = await addVercelDomain(hostname)
          const shortLinkDomain = await tx.shortLinkDomain.create({
            ...query,
            data: {
              hostname,
              apexName,
              services: services ?? [],
              pathPrefix,
              redirectStatus: input.redirectStatus ?? undefined,
              slugAllowedChars: input.slugAllowedChars ?? undefined,
              slugMinLength: input.slugMinLength ?? undefined,
              slugMaxLength: input.slugMaxLength ?? undefined,
              slugCaseSensitive: input.slugCaseSensitive ?? undefined,
              reservedPaths: input.reservedPaths ?? undefined,
              fallbackTo: input.fallbackTo,
              notFound: input.notFound ?? undefined,
              passthroughOrigin: input.passthroughOrigin,
              autoFailover: input.autoFailover ?? undefined
            }
          })
          const edgePublishedAt = await publishDomain(shortLinkDomain.id, tx)
          return edgePublishedAt == null
            ? shortLinkDomain
            : { ...shortLinkDomain, edgePublishedAt }
        } catch (e) {
          if (
            e instanceof Prisma.PrismaClientKnownRequestError &&
            e.code === 'P2002'
          ) {
            throw new NotUniqueError('short link domain already exists', [
              { path: ['input', 'hostname'], value: hostname }
            ])
          }
          await removeVercelDomain(hostname)
          throw e
        }
      })
    }
  }),
  shortLinkDomainUpdate: t.withAuth(adminScopes).prismaFieldWithInput({
    type: 'ShortLinkDomain',
    description:
      'Update the services and edge settings of a short link domain; routing changes republish every live link on it',
    errors: {
      types: [ZodError, NotFoundError]
    },
    nullable: false,
    input: {
      id: t.input.string({ required: true }),
      services: t.input.field({
        type: [Service],
        required: true,
        description:
          'the services that are enabled for this domain, if empty then this domain can be used by all services'
      }),
      pathPrefix: t.input.string({
        required: false,
        description:
          'path the short links live under, without leading or trailing slashes (e.g. s); empty serves links at the root of the hostname'
      }),
      redirectStatus: t.input.int({
        required: false,
        validate: {
          refine: [isRedirectStatus, { message: REDIRECT_STATUS_MESSAGE }]
        }
      }),
      slugAllowedChars: t.input.string({
        required: false,
        validate: {
          refine: [
            isValidSlugAllowedChars,
            { message: SLUG_ALLOWED_CHARS_MESSAGE }
          ]
        }
      }),
      slugMinLength: t.input.int({
        required: false,
        validate: { min: 1, max: SLUG_MAX_LENGTH_LIMIT }
      }),
      slugMaxLength: t.input.int({
        required: false,
        validate: { min: 1, max: SLUG_MAX_LENGTH_LIMIT }
      }),
      slugCaseSensitive: t.input.boolean({ required: false }),
      reservedPaths: t.input.stringList({ required: false }),
      fallbackTo: t.input.string({
        required: false,
        validate: { refine: [isHttpsUrl, { message: HTTPS_URL_MESSAGE }] }
      }),
      notFound: t.input.field({ type: ShortLinkNotFound, required: false }),
      passthroughOrigin: t.input.string({
        required: false,
        description: 'required when notFound is passthrough',
        validate: { refine: [isHttpsUrl, { message: HTTPS_URL_MESSAGE }] }
      }),
      autoFailover: t.input.boolean({ required: false })
    },
    resolve: async (query, _, { input }) => {
      const existing = await prisma.shortLinkDomain.findUnique({
        where: { id: input.id }
      })
      if (existing == null)
        throw new NotFoundError('short link domain not found', [
          { path: ['input', 'id'], value: input.id }
        ])

      const pathPrefix = resolvePathPrefix(input.pathPrefix)
      assertDomainSettings({
        notFound: input.notFound ?? existing.notFound,
        passthroughOrigin:
          input.passthroughOrigin === undefined
            ? existing.passthroughOrigin
            : input.passthroughOrigin,
        slugMinLength: input.slugMinLength ?? existing.slugMinLength,
        slugMaxLength: input.slugMaxLength ?? existing.slugMaxLength
      })

      return await prisma.$transaction(async (tx) => {
        const shortLinkDomain = await tx.shortLinkDomain.update({
          ...query,
          where: { id: input.id },
          data: {
            services: input.services,
            pathPrefix,
            redirectStatus: input.redirectStatus ?? undefined,
            slugAllowedChars: input.slugAllowedChars ?? undefined,
            slugMinLength: input.slugMinLength ?? undefined,
            slugMaxLength: input.slugMaxLength ?? undefined,
            slugCaseSensitive: input.slugCaseSensitive ?? undefined,
            reservedPaths: input.reservedPaths ?? undefined,
            fallbackTo: input.fallbackTo,
            notFound: input.notFound ?? undefined,
            passthroughOrigin: input.passthroughOrigin,
            autoFailover: input.autoFailover ?? undefined
          }
        })
        const edgePublishedAt = routingChanged(existing, shortLinkDomain)
          ? await publishDomainWithLinks(input.id, tx)
          : await publishDomain(input.id, tx)
        return edgePublishedAt == null
          ? shortLinkDomain
          : { ...shortLinkDomain, edgePublishedAt }
      })
    }
  }),
  shortLinkDomainDelete: t.withAuth(adminScopes).prismaField({
    type: 'ShortLinkDomain',
    description:
      'delete an existing short link domain (all related short links must be deleted first)',
    errors: {
      types: [NotFoundError, ForeignKeyConstraintError]
    },
    nullable: false,
    args: {
      id: t.arg.string({ required: true })
    },
    resolve: async (query, _, { id }) => {
      return await prisma.$transaction(async (tx) => {
        try {
          const shortLinkDomain = await tx.shortLinkDomain.delete({
            ...query,
            where: { id }
          })
          await removeVercelDomain(shortLinkDomain.hostname)
          await unpublishDomain(shortLinkDomain.hostname)
          return shortLinkDomain
        } catch (e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === 'P2025') {
              // P2025: Record to delete not found
              throw new NotFoundError('short link domain not found', [
                {
                  path: ['id'],
                  value: id
                }
              ])
            }
            if (e.code === 'P2003') {
              // P2003: Record to delete is in use
              throw new ForeignKeyConstraintError(
                'short link domain still has associated short links',
                [
                  {
                    path: ['id'],
                    value: id
                  }
                ]
              )
            }
          }
          throw e
        }
      })
    }
  })
}))
