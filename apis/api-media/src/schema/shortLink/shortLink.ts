import { nanoid } from 'nanoid'
import { v4 as uuidv4 } from 'uuid'
import { ZodError } from 'zod'

import { Prisma, ShortLinkDomain, prisma } from '@core/prisma/media/client'

import { builder } from '../builder'
import { Service } from '../enums/service'
import { NotFoundError, NotUniqueError } from '../error'

import { publishLink, unpublishLink } from './edge'
import { RedirectType } from './enums/redirectType'
import { ShortLinkAssetClass } from './enums/shortLinkAssetClass'
import { ShortLinkHealth } from './enums/shortLinkHealth'
import { ShortLinkPlacement } from './enums/shortLinkPlacement'
import { ShortLinkStatus } from './enums/shortLinkStatus'
import { ShortLinksFilter, ShortLinksFilterInput } from './inputs'
import {
  assertShortLinkAdmin,
  contextActor,
  isProtectedAssetClass
} from './lib/access'
import {
  HTTPS_URL_MESSAGE,
  REDIRECT_STATUS_MESSAGE,
  inputValidationError,
  isHttpsUrl,
  isRedirectStatus
} from './lib/errors'
import { normalizePathname, validatePathname } from './lib/slug'

// The convention lives in the field description so every future writer sees it.
// Deliberately unvalidated: new schemes get registered by documenting them here,
// not by editing a regex. If a link ever needs two attributions, that is the
// moment for a real column — not a delimiter grammar packed into this string.
const SOURCE_REF_DESCRIPTION =
  'a single namespaced `<scheme>:<value>` attribution for the thing this short link was minted for, one value per link. Registered schemes: `youtube-channel:<channelId>`'

const TO_DESCRIPTION =
  'the fully qualified domain name (FQDN) to redirect the short link service should redirect the user to'

const HOSTNAME_INVALID_MESSAGE =
  'hostname not valid (short link domain may not exist or may not be setup for this service)'

const BLOCKLIST_MESSAGE =
  'to URL appears on blocklist (https://github.com/blocklistproject/Lists)'

const GENERATED_PATHNAME_LENGTH = 11
const GENERATED_PATHNAME_ATTEMPTS = 5

// editor = shortLinkEditor, shortLinkAdmin, publisher, or a valid interop token
const editorScopes = {
  $any: { isPublisher: true, isShortLinkEditor: true, isValidInterop: true }
} as const

export const ShortLink = builder.prismaObject('ShortLink', {
  description: 'A short link that redirects to a full URL',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    pathname: t.exposeString('pathname', {
      nullable: false,
      description: 'short link path not including the leading slash'
    }),
    to: t.exposeString('to', {
      nullable: false,
      description: TO_DESCRIPTION
    }),
    domain: t.relation('domain', { nullable: false }),
    service: t.expose('service', {
      type: Service,
      nullable: false,
      description: 'the service that created this short link'
    }),
    brightcoveId: t.exposeString('brightcoveId', {
      nullable: true,
      description: 'brightcove video ID for video redirects'
    }),
    redirectType: t.expose('redirectType', {
      type: RedirectType,
      nullable: true,
      description: 'type of video redirect (hls, dl, dh, s)'
    }),
    bitrate: t.exposeInt('bitrate', {
      nullable: true,
      description: 'bitrate of the video variant download'
    }),
    sourceRef: t.exposeString('sourceRef', {
      nullable: true,
      description: SOURCE_REF_DESCRIPTION
    }),
    name: t.exposeString('name', {
      nullable: true,
      description: 'human label shown in the admin app'
    }),
    description: t.exposeString('description', { nullable: true }),
    assetClass: t.expose('assetClass', {
      type: ShortLinkAssetClass,
      nullable: false,
      description:
        'drives the protection rules: permanent and videoEmbedded links need a short link admin to change their destination or be deleted'
    }),
    status: t.expose('status', { type: ShortLinkStatus, nullable: false }),
    redirectStatus: t.exposeInt('redirectStatus', {
      nullable: true,
      description: 'per-link override of the domain redirect status'
    }),
    fallbackTo: t.exposeString('fallbackTo', {
      nullable: true,
      description:
        'per-link override of the domain fallbackTo, used while paused'
    }),
    placement: t.expose('placement', {
      type: ShortLinkPlacement,
      nullable: true
    }),
    language: t.exposeString('language', {
      nullable: true,
      description: 'BCP-47 language tag'
    }),
    tags: t.exposeStringList('tags', { nullable: false }),
    videoId: t.exposeString('videoId', {
      nullable: true,
      description: 'core Video this link belongs to'
    }),
    youtubeVideoId: t.exposeString('youtubeVideoId', {
      nullable: true,
      description: 'YouTube video id the link is placed in'
    }),
    campaigns: t.relation('campaigns', {
      nullable: false,
      query: { orderBy: { name: 'asc' } }
    }),
    destinationHistory: t.relation('destinationHistory', {
      nullable: false,
      description: 'every change to `to`, newest first',
      query: { orderBy: { changedAt: 'desc' } }
    }),
    userId: t.exposeString('userId', {
      nullable: true,
      description:
        'the user that created this short link (empty when created by a subgraph)'
    }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
    deletedAt: t.expose('deletedAt', { type: 'DateTime', nullable: true }),
    edgePublishedAt: t.expose('edgePublishedAt', {
      type: 'DateTime',
      nullable: true,
      description: 'when the routing record was last written to the edge store'
    }),
    healthStatus: t.expose('healthStatus', {
      type: ShortLinkHealth,
      nullable: true
    }),
    healthCheckedAt: t.expose('healthCheckedAt', {
      type: 'DateTime',
      nullable: true
    }),
    shortUrl: t.field({
      type: 'String',
      nullable: false,
      description: 'https://<hostname>/<pathname>',
      select: { pathname: true, domain: { select: { hostname: true } } },
      resolve: ({ pathname, domain }) =>
        `https://${domain.hostname}/${pathname}`
    }),
    qrUrl: t.field({
      type: 'String',
      nullable: false,
      description: 'shortUrl + ?qr=1 — what QR images encode',
      select: { pathname: true, domain: { select: { hostname: true } } },
      resolve: ({ pathname, domain }) =>
        `https://${domain.hostname}/${pathname}?qr=1`
    })
  })
})

builder.asEntity(ShortLink, {
  key: builder.selection<{ id: string }>('id'),
  resolveReference: async ({ id }) =>
    await prisma.shortLink.findUniqueOrThrow({ where: { id } })
})

function buildShortLinksWhere(
  hostname: string | null | undefined,
  filter: ShortLinksFilterInput | null | undefined
): Prisma.ShortLinkWhereInput {
  const where: Prisma.ShortLinkWhereInput = {}
  if (filter?.includeDeleted !== true) where.deletedAt = null
  const effectiveHostname = hostname ?? filter?.hostname
  if (effectiveHostname != null) where.domain = { hostname: effectiveHostname }
  if (filter == null) return where

  if (filter.status != null) where.status = filter.status
  if (filter.assetClass != null) where.assetClass = filter.assetClass
  if (filter.placement != null) where.placement = filter.placement
  if (filter.videoId != null) where.videoId = filter.videoId
  if (filter.youtubeVideoId != null)
    where.youtubeVideoId = filter.youtubeVideoId
  if (filter.service != null) where.service = filter.service
  if (filter.tag != null) where.tags = { has: filter.tag }
  if (filter.campaignId != null)
    where.campaigns = { some: { id: filter.campaignId } }
  if (filter.search != null && filter.search !== '') {
    const contains = { contains: filter.search, mode: 'insensitive' as const }
    where.OR = [
      { pathname: contains },
      { to: contains },
      { name: contains },
      { description: contains },
      { youtubeVideoId: contains }
    ]
  }
  return where
}

/**
 * Pathname validation needs the domain's slug grammar, so it happens in the
 * resolver rather than the input validators. Generated pathnames are retried a
 * few times when the grammar is stricter than nanoid's alphabet.
 */
function resolveCreatePathname(
  inputPathname: string | null | undefined,
  domain: ShortLinkDomain
): string {
  if (inputPathname != null) {
    const pathname = normalizePathname(inputPathname, domain)
    const error = validatePathname(pathname, domain)
    if (error != null)
      throw inputValidationError(['input', 'pathname'], error.message)
    return pathname
  }

  for (let attempt = 0; attempt < GENERATED_PATHNAME_ATTEMPTS; attempt++) {
    const pathname = normalizePathname(
      nanoid(GENERATED_PATHNAME_LENGTH),
      domain
    )
    if (validatePathname(pathname, domain) == null) return pathname
  }
  throw inputValidationError(
    ['input', 'pathname'],
    'could not generate a pathname that satisfies the domain slug grammar; supply one'
  )
}

async function assertCampaignsExist(
  campaignIds: string[] | null | undefined
): Promise<void> {
  if (campaignIds == null || campaignIds.length === 0) return
  const uniqueIds = [...new Set(campaignIds)]
  const count = await prisma.shortLinkCampaign.count({
    where: { id: { in: uniqueIds } }
  })
  if (count === uniqueIds.length) return
  throw inputValidationError(
    ['input', 'campaignIds'],
    'one or more campaigns do not exist'
  )
}

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  )
}

async function isNotBlocklisted(to: string): Promise<boolean> {
  let hostname: string
  try {
    hostname = new URL(to).hostname
  } catch {
    return true
  }
  return (
    (await prisma.shortLinkBlocklistDomain.findFirst({
      where: { hostname }
    })) == null
  )
}

builder.queryFields((t) => ({
  shortLinkByPath: t.prismaField({
    type: 'ShortLink',
    description:
      'find a live short link by path and hostname (deleted and retired links are not found; paused links are)',
    errors: {
      types: [NotFoundError]
    },
    args: {
      pathname: t.arg.string({
        required: true,
        description: 'short link path not including the leading slash'
      }),
      hostname: t.arg.string({
        required: true,
        description:
          'the hostname including subdomain, domain, and TLD, but excluding port'
      })
    },
    nullable: false,
    resolve: async (query, _, { pathname, hostname }) => {
      try {
        return await prisma.shortLink.findFirstOrThrow({
          ...query,
          where: {
            pathname,
            domain: { hostname },
            deletedAt: null,
            status: { not: 'retired' }
          }
        })
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2025'
        )
          throw new NotFoundError('short link not found', [
            { path: ['pathname'], value: pathname },
            { path: ['hostname'], value: hostname }
          ])
        throw e
      }
    }
  }),
  shortLink: t.withAuth(editorScopes).prismaField({
    type: 'ShortLink',
    description: 'find a short link by id',
    errors: {
      types: [NotFoundError]
    },
    args: {
      id: t.arg.string({ required: true })
    },
    nullable: false,
    resolve: async (query, _, { id }) => {
      try {
        return await prisma.shortLink.findFirstOrThrow({
          ...query,
          where: { id }
        })
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2025'
        )
          throw new NotFoundError('short link not found', [
            { path: ['id'], value: id }
          ])
        throw e
      }
    }
  }),
  shortLinks: t.withAuth(editorScopes).prismaConnection({
    cursor: 'id',
    type: 'ShortLink',
    description:
      'find all short links with optional hostname filter (soft-deleted links are excluded unless filter.includeDeleted is set)',
    nullable: false,
    args: {
      hostname: t.arg.string({
        description:
          'the hostname including subdomain, domain, and TLD, but excluding port'
      }),
      filter: t.arg({ type: ShortLinksFilter, required: false })
    },
    resolve: async (query, _, { hostname, filter }) =>
      await prisma.shortLink.findMany({
        ...query,
        where: buildShortLinksWhere(hostname, filter),
        orderBy: {
          domain: { hostname: 'asc' },
          pathname: 'asc'
        }
      }),
    totalCount: async (_, { hostname, filter }) =>
      await prisma.shortLink.count({
        where: buildShortLinksWhere(hostname, filter)
      })
  })
}))

builder.mutationFields((t) => ({
  shortLinkCreate: t.withAuth(editorScopes).prismaFieldWithInput({
    type: 'ShortLink',
    description: 'create a new short link',
    errors: {
      types: [ZodError, NotUniqueError]
    },
    nullable: false,
    input: {
      id: t.input.string({
        required: false,
        description:
          'the unique identifier for the short link (will generate if not given)'
      }),
      pathname: t.input.string({
        required: false,
        description:
          'short link path not including the leading slash (defaults to a random 11 character string that is URL friendly). Must satisfy the domain slug grammar and must not be a reserved path'
      }),
      to: t.input.string({
        required: true,
        description: TO_DESCRIPTION,
        validate: {
          url: true,
          refine: [isNotBlocklisted, { message: BLOCKLIST_MESSAGE }]
        }
      }),
      hostname: t.input.string({
        required: true,
        description:
          'the hostname including subdomain, domain, and TLD, but excluding port'
      }),
      service: t.input.field({
        type: Service,
        required: true,
        description: 'the service that created this short link'
      }),
      brightcoveId: t.input.string({
        required: false,
        description: 'brightcove video ID for video redirects'
      }),
      redirectType: t.input.field({
        type: RedirectType,
        required: false,
        description: 'type of video redirect (hls, dl, dh, s)'
      }),
      bitrate: t.input.int({
        required: false,
        description: 'bitrate of the video variant download'
      }),
      sourceRef: t.input.string({
        required: false,
        description: SOURCE_REF_DESCRIPTION
      }),
      name: t.input.string({ required: false }),
      description: t.input.string({ required: false }),
      assetClass: t.input.field({
        type: ShortLinkAssetClass,
        required: false,
        description: 'defaults to standard'
      }),
      status: t.input.field({
        type: ShortLinkStatus,
        required: false,
        description: 'defaults to active'
      }),
      redirectStatus: t.input.int({
        required: false,
        description: 'per-link override of the domain redirect status',
        validate: {
          refine: [isRedirectStatus, { message: REDIRECT_STATUS_MESSAGE }]
        }
      }),
      fallbackTo: t.input.string({
        required: false,
        description:
          'per-link override of the domain fallbackTo, used while paused',
        validate: { refine: [isHttpsUrl, { message: HTTPS_URL_MESSAGE }] }
      }),
      placement: t.input.field({ type: ShortLinkPlacement, required: false }),
      language: t.input.string({
        required: false,
        description: 'BCP-47 language tag'
      }),
      tags: t.input.stringList({ required: false }),
      videoId: t.input.string({ required: false }),
      youtubeVideoId: t.input.string({ required: false }),
      campaignIds: t.input.stringList({ required: false })
    },
    validate: [
      async ({ input: { hostname, service } }) => {
        return (
          (await prisma.shortLinkDomain.findFirst({
            where: {
              hostname,
              OR: [
                { services: { hasEvery: [service] } },
                { services: { isEmpty: true } }
              ]
            }
          })) != null
        )
      },
      {
        path: ['input', 'hostname'],
        message: HOSTNAME_INVALID_MESSAGE
      }
    ],
    resolve: async (query, _, { input }, context) => {
      const domain = await prisma.shortLinkDomain.findFirst({
        where: { hostname: input.hostname }
      })
      if (domain == null)
        throw inputValidationError(
          ['input', 'hostname'],
          HOSTNAME_INVALID_MESSAGE
        )

      const pathname = resolveCreatePathname(input.pathname, domain)
      await assertCampaignsExist(input.campaignIds)
      const id = input.id ?? uuidv4()

      try {
        return await prisma.$transaction(async (tx) => {
          const shortLink = await tx.shortLink.create({
            ...query,
            data: {
              id,
              pathname,
              to: input.to,
              domain: { connect: { hostname: input.hostname } },
              service: input.service,
              userId:
                context.type === 'authenticated' ? context.user.id : undefined,
              brightcoveId: input.brightcoveId,
              redirectType: input.redirectType,
              bitrate: input.bitrate,
              sourceRef: input.sourceRef,
              name: input.name,
              description: input.description,
              assetClass: input.assetClass ?? undefined,
              status: input.status ?? undefined,
              redirectStatus: input.redirectStatus,
              fallbackTo: input.fallbackTo,
              placement: input.placement,
              language: input.language,
              tags: input.tags ?? undefined,
              video:
                input.videoId != null
                  ? { connect: { id: input.videoId } }
                  : undefined,
              youtubeVideoId: input.youtubeVideoId,
              campaigns:
                input.campaignIds != null && input.campaignIds.length > 0
                  ? {
                      connect: input.campaignIds.map((campaignId) => ({
                        id: campaignId
                      }))
                    }
                  : undefined
            }
          })
          const edgePublishedAt = await publishLink(id, tx)
          return edgePublishedAt == null
            ? shortLink
            : { ...shortLink, edgePublishedAt }
        })
      } catch (e) {
        if (isUniqueViolation(e))
          throw new NotUniqueError('short link already exists', [
            { path: ['input', 'hostname'], value: input.hostname },
            { path: ['input', 'pathname'], value: pathname }
          ])
        throw e
      }
    }
  }),
  shortLinkUpdate: t.withAuth(editorScopes).prismaFieldWithInput({
    type: 'ShortLink',
    description:
      'update an existing short link (the pathname is immutable). Changing `to` on a permanent or videoEmbedded link needs a short link admin; videoEmbedded also needs a note',
    errors: {
      types: [ZodError, NotFoundError]
    },
    nullable: false,
    input: {
      id: t.input.string({ required: true }),
      to: t.input.string({
        required: true,
        description: TO_DESCRIPTION,
        validate: {
          url: true,
          refine: [isNotBlocklisted, { message: BLOCKLIST_MESSAGE }]
        }
      }),
      brightcoveId: t.input.string({
        required: false,
        description: 'brightcove video ID for video redirects'
      }),
      redirectType: t.input.field({
        type: RedirectType,
        required: false,
        description: 'type of video redirect (hls, dl, dh, s)'
      }),
      bitrate: t.input.int({
        required: false,
        description: 'bitrate of the video variant download'
      }),
      name: t.input.string({ required: false }),
      description: t.input.string({ required: false }),
      assetClass: t.input.field({
        type: ShortLinkAssetClass,
        required: false,
        description:
          'changing a permanent or videoEmbedded link to another class needs a short link admin'
      }),
      status: t.input.field({ type: ShortLinkStatus, required: false }),
      redirectStatus: t.input.int({
        required: false,
        description: 'per-link override of the domain redirect status',
        validate: {
          refine: [isRedirectStatus, { message: REDIRECT_STATUS_MESSAGE }]
        }
      }),
      fallbackTo: t.input.string({
        required: false,
        description:
          'per-link override of the domain fallbackTo, used while paused',
        validate: { refine: [isHttpsUrl, { message: HTTPS_URL_MESSAGE }] }
      }),
      placement: t.input.field({ type: ShortLinkPlacement, required: false }),
      language: t.input.string({
        required: false,
        description: 'BCP-47 language tag'
      }),
      tags: t.input.stringList({ required: false }),
      videoId: t.input.string({ required: false }),
      youtubeVideoId: t.input.string({ required: false }),
      campaignIds: t.input.stringList({
        required: false,
        description: 'replaces the campaign membership when given'
      }),
      note: t.input.string({
        required: false,
        description:
          'recorded on the destination history row when `to` changes; required for videoEmbedded links'
      })
    },
    resolve: async (query, _, { input }, context) => {
      const existing = await prisma.shortLink.findFirst({
        where: { id: input.id, deletedAt: null }
      })
      if (existing == null)
        throw new NotFoundError('short link not found', [
          { path: ['input', 'id'], value: input.id }
        ])

      const destinationChanged = input.to !== existing.to
      if (destinationChanged && isProtectedAssetClass(existing.assetClass)) {
        assertShortLinkAdmin(
          context,
          `only a short link admin may change the destination of a ${existing.assetClass} link`
        )
        if (
          existing.assetClass === 'videoEmbedded' &&
          (input.note == null || input.note.trim() === '')
        )
          throw inputValidationError(
            ['input', 'note'],
            'a note is required when changing the destination of a videoEmbedded link'
          )
      }
      if (
        input.assetClass != null &&
        input.assetClass !== existing.assetClass &&
        isProtectedAssetClass(existing.assetClass)
      )
        assertShortLinkAdmin(
          context,
          `only a short link admin may change the asset class of a ${existing.assetClass} link`
        )
      await assertCampaignsExist(input.campaignIds)

      return await prisma.$transaction(async (tx) => {
        const shortLink = await tx.shortLink.update({
          ...query,
          where: { id: input.id },
          data: {
            to: input.to,
            brightcoveId: input.brightcoveId,
            redirectType: input.redirectType,
            bitrate: input.bitrate,
            name: input.name,
            description: input.description,
            assetClass: input.assetClass ?? undefined,
            status: input.status ?? undefined,
            redirectStatus: input.redirectStatus,
            fallbackTo: input.fallbackTo,
            placement: input.placement,
            language: input.language,
            tags: input.tags ?? undefined,
            videoId: input.videoId,
            youtubeVideoId: input.youtubeVideoId,
            campaigns:
              input.campaignIds != null
                ? {
                    set: input.campaignIds.map((campaignId) => ({
                      id: campaignId
                    }))
                  }
                : undefined
          }
        })
        if (destinationChanged)
          await tx.shortLinkDestinationHistory.create({
            data: {
              shortLinkId: input.id,
              from: existing.to,
              to: input.to,
              changedBy: contextActor(context),
              note: input.note ?? undefined
            }
          })
        const edgePublishedAt = await publishLink(input.id, tx)
        return edgePublishedAt == null
          ? shortLink
          : { ...shortLink, edgePublishedAt }
      })
    }
  }),
  shortLinkDelete: t.withAuth(editorScopes).prismaField({
    type: 'ShortLink',
    description:
      'soft delete an existing short link: it stops resolving and its pathname is never reissued. Permanent and videoEmbedded links need a short link admin',
    errors: {
      types: [NotFoundError]
    },
    nullable: false,
    args: {
      id: t.arg.string({ required: true })
    },
    resolve: async (query, _, { id }, context) => {
      const existing = await prisma.shortLink.findFirst({
        where: { id, deletedAt: null }
      })
      if (existing == null)
        throw new NotFoundError('short link not found', [
          { path: ['id'], value: id }
        ])
      if (isProtectedAssetClass(existing.assetClass))
        assertShortLinkAdmin(
          context,
          `only a short link admin may delete a ${existing.assetClass} link`
        )

      return await prisma.$transaction(async (tx) => {
        const shortLink = await tx.shortLink.update({
          ...query,
          where: { id },
          data: { deletedAt: new Date(), status: 'retired' }
        })
        await unpublishLink(id, tx)
        return shortLink
      })
    }
  })
}))
