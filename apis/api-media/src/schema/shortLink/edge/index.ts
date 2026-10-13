export { getEdgeConfig } from './client'
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
  effectiveDestination,
  effectiveRedirectStatus,
  isLiveLink,
  type DomainRecord,
  type RoutingRecord
} from './records'
