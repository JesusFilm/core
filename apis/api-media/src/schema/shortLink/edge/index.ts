export {
  publishDomain,
  publishDomainWithLinks,
  publishLink,
  unpublishDomain,
  unpublishLink
} from './publish'
export {
  buildDomainRecord,
  buildRoutingRecord,
  domainKey,
  domainLinkKey,
  globalLinkKey,
  globalRecordKeyForLink,
  effectiveDestination,
  effectiveRedirectStatus,
  isLiveLink,
  recordKeyForLink,
  type DomainRecord,
  type RoutingRecord
} from './records'
