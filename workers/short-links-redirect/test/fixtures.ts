import type { DomainRecord, RoutingRecord } from '../src/records'

export function domainRecord(
  overrides: Partial<DomainRecord> & Pick<DomainRecord, 'hostname'>
): DomainRecord {
  return {
    v: 1,
    id: `domain-${overrides.hostname}`,
    redirectStatus: 307,
    fallbackTo: null,
    notFound: 'lostPage',
    passthroughOrigin: null,
    reservedPaths: [],
    slugCaseSensitive: true,
    pathPrefix: '',
    kvBinding: null,
    ...overrides
  }
}

export function routingRecord(
  overrides: Partial<RoutingRecord> = {}
): RoutingRecord {
  return {
    v: 1,
    id: 'link-1',
    to: 'https://www.jesusfilm.org/watch/jesus.html',
    status: null,
    fallbackTo: null,
    paused: false,
    assetClass: 'standard',
    placement: null,
    campaignIds: [],
    videoId: null,
    youtubeVideoId: null,
    language: null,
    global: false,
    hostname: '',
    ...overrides
  }
}
