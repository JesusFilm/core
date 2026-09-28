import type {
  ShortLink,
  ShortLinkCampaign,
  ShortLinkDestinationHistory,
  ShortLinkDomain
} from '@core/prisma/media/client'

export function buildShortLinkDomain(
  overrides: Partial<ShortLinkDomain> = {}
): ShortLinkDomain {
  return {
    id: 'domainId',
    hostname: 'example.com',
    apexName: 'example.com',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    services: [],
    pathPrefix: '',
    redirectStatus: 307,
    slugAllowedChars: 'A-Za-z0-9_-',
    slugMinLength: 1,
    slugMaxLength: 64,
    slugCaseSensitive: true,
    reservedPaths: [],
    fallbackTo: null,
    notFound: 'lostPage',
    passthroughOrigin: null,
    autoFailover: false,
    edgePublishedAt: null,
    ...overrides
  }
}

export function buildShortLink(overrides: Partial<ShortLink> = {}): ShortLink {
  return {
    id: 'testId',
    pathname: 'testPath',
    to: 'https://example.com',
    domainId: 'domainId',
    userId: 'testUserId',
    service: 'apiJourneys',
    brightcoveId: null,
    redirectType: null,
    bitrate: null,
    sourceRef: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    name: null,
    description: null,
    assetClass: 'standard',
    status: 'active',
    redirectStatus: null,
    fallbackTo: null,
    placement: null,
    language: null,
    tags: [],
    videoId: null,
    youtubeVideoId: null,
    deletedAt: null,
    edgePublishedAt: null,
    healthStatus: null,
    healthCheckedAt: null,
    ...overrides
  }
}

export function buildShortLinkWithDomain(
  overrides: Partial<ShortLink> = {},
  domainOverrides: Partial<ShortLinkDomain> = {}
): ShortLink & { domain: ShortLinkDomain } {
  const domain = buildShortLinkDomain(domainOverrides)
  return { ...buildShortLink({ domainId: domain.id, ...overrides }), domain }
}

export function buildShortLinkCampaign(
  overrides: Partial<ShortLinkCampaign> = {}
): ShortLinkCampaign {
  return {
    id: 'campaignId',
    name: 'Spring push',
    description: null,
    startsAt: null,
    endsAt: null,
    tags: [],
    ownerId: 'testUserId',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides
  }
}

export function buildShortLinkDestinationHistory(
  overrides: Partial<ShortLinkDestinationHistory> = {}
): ShortLinkDestinationHistory {
  return {
    id: 'historyId',
    shortLinkId: 'testId',
    from: 'https://example.com',
    to: 'https://example.com/new',
    changedBy: 'testUserId',
    changedAt: new Date('2026-01-02T00:00:00.000Z'),
    note: null,
    ...overrides
  }
}

/**
 * Attach loaded relations (campaigns, _count, ...) to a fixture without
 * tripping TypeScript's excess-property check on `mockResolvedValue`.
 */
export function withRelations<Base extends object>(
  base: Base,
  relations: Record<string, unknown>
): Base {
  return { ...base, ...relations }
}
