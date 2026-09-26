import {
  ShortLink as PrismaShortLink,
  ShortLinkDomain,
  prisma
} from '@core/prisma/media/client'

import { builder } from '../builder'

import { effectiveDestination, effectiveRedirectStatus } from './edge'
import {
  ShortLinkResolutionSource,
  ShortLinkResolutionSourceValue
} from './enums/shortLinkResolutionSource'
import {
  EDGE_PATH_PATTERN,
  isReservedPath,
  normalizePathname
} from './lib/slug'
import { ShortLink } from './shortLink'

export interface ShortLinkResolutionShape {
  found: boolean
  location: string | null
  status: number
  source: ShortLinkResolutionSourceValue
  shortLink: PrismaShortLink | null
}

const LOST_PAGE_STATUS = 404

export const ShortLinkResolution = builder
  .objectRef<ShortLinkResolutionShape>('ShortLinkResolution')
  .implement({
    description:
      'What the edge Worker would answer for a hostname + pathname, computed from the control-plane data (Test Redirect)',
    fields: (t) => ({
      found: t.exposeBoolean('found', {
        nullable: false,
        description: 'true when a live short link answered'
      }),
      location: t.exposeString('location', {
        nullable: true,
        description: 'redirect target; null for the lost page'
      }),
      status: t.exposeInt('status', {
        nullable: false,
        description:
          'HTTP status the edge responds with (404 for the lost page)'
      }),
      source: t.expose('source', {
        type: ShortLinkResolutionSource,
        nullable: false
      }),
      shortLink: t.field({
        type: ShortLink,
        nullable: true,
        resolve: ({ shortLink }) => shortLink
      })
    })
  })

function lostPage(
  shortLink: PrismaShortLink | null = null
): ShortLinkResolutionShape {
  return {
    found: false,
    location: null,
    status: LOST_PAGE_STATUS,
    source: 'lostPage',
    shortLink
  }
}

/** The domain's not-found behaviour for a request path (+ query). */
function notFoundResolution(
  domain: ShortLinkDomain,
  requestPath: string,
  source: ShortLinkResolutionSourceValue | null = null
): ShortLinkResolutionShape {
  switch (domain.notFound) {
    case 'fallback':
      if (domain.fallbackTo == null) return lostPage()
      return {
        found: false,
        location: domain.fallbackTo,
        status: domain.redirectStatus,
        source: source ?? 'domainFallback',
        shortLink: null
      }
    case 'passthrough':
      if (domain.passthroughOrigin == null) return lostPage()
      return {
        found: false,
        location: `${domain.passthroughOrigin.replace(/\/+$/, '')}/${requestPath}`,
        status: domain.redirectStatus,
        source: source ?? 'passthrough',
        shortLink: null
      }
    default:
      return { ...lostPage(), source: source ?? 'lostPage' }
  }
}

export async function resolveShortLink(
  hostname: string,
  pathnameInput: string
): Promise<ShortLinkResolutionShape> {
  const domain = await prisma.shortLinkDomain.findUnique({
    where: { hostname: hostname.toLowerCase() }
  })
  if (domain == null) return lostPage()

  const requestPath = pathnameInput.replace(/^\/+/, '')
  if (isReservedPath(requestPath, domain.reservedPaths))
    return notFoundResolution(domain, requestPath, 'reserved')
  if (
    requestPath === '' ||
    requestPath.includes('/') ||
    !EDGE_PATH_PATTERN.test(requestPath)
  )
    return notFoundResolution(domain, requestPath)

  const shortLink = await prisma.shortLink.findFirst({
    where: {
      domainId: domain.id,
      pathname: normalizePathname(requestPath, domain),
      deletedAt: null,
      status: { not: 'retired' }
    },
    include: { domain: true, campaigns: true }
  })
  if (shortLink == null) return notFoundResolution(domain, requestPath)

  const status = effectiveRedirectStatus(shortLink, domain)
  if (shortLink.status === 'paused') {
    if (shortLink.fallbackTo != null)
      return {
        found: true,
        location: shortLink.fallbackTo,
        status,
        source: 'linkFallback',
        shortLink
      }
    if (domain.fallbackTo != null)
      return {
        found: true,
        location: domain.fallbackTo,
        status,
        source: 'domainFallback',
        shortLink
      }
    return { ...notFoundResolution(domain, requestPath), shortLink }
  }

  return {
    found: true,
    location: effectiveDestination(shortLink, domain),
    status,
    source: 'link',
    shortLink
  }
}

builder.queryFields((t) => ({
  shortLinkResolve: t
    .withAuth({
      $any: { isPublisher: true, isShortLinkEditor: true, isValidInterop: true }
    })
    .field({
      type: ShortLinkResolution,
      description:
        'what the edge Worker would answer for this hostname and pathname (Test Redirect); mirrors the Worker lookup order',
      nullable: false,
      args: {
        hostname: t.arg.string({ required: true }),
        pathname: t.arg.string({
          required: true,
          description: 'path with or without the leading slash'
        })
      },
      resolve: async (_, { hostname, pathname }) =>
        await resolveShortLink(hostname, pathname)
    })
}))
