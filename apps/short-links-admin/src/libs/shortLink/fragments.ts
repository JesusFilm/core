import { graphql } from '@core/shared/gql'

export const SHORT_LINK_FIELDS = graphql(`
  fragment ShortLinkFields on ShortLink @_unmask {
    id
    pathname
    to
    shortUrl
    qrUrl
    service
    name
    description
    assetClass
    status
    redirectStatus
    fallbackTo
    placement
    language
    tags
    videoId
    youtubeVideoId
    userId
    createdAt
    updatedAt
    deletedAt
    edgePublishedAt
    healthStatus
    healthCheckedAt
    domain {
      id
      hostname
    }
    campaigns {
      id
      name
    }
  }
`)

export const SHORT_LINK_DOMAIN_FIELDS = graphql(`
  fragment ShortLinkDomainFields on ShortLinkDomain @_unmask {
    id
    hostname
    pathPrefix
    apexName
    services
    redirectStatus
    slugAllowedChars
    slugMinLength
    slugMaxLength
    slugCaseSensitive
    reservedPaths
    fallbackTo
    notFound
    passthroughOrigin
    autoFailover
    edgePublishedAt
    linkCount
  }
`)

export const SHORT_LINK_CAMPAIGN_FIELDS = graphql(`
  fragment ShortLinkCampaignFields on ShortLinkCampaign @_unmask {
    id
    name
    description
    startsAt
    endsAt
    tags
    ownerId
    createdAt
    updatedAt
    linkCount
  }
`)

export const SHORT_LINK_STATS_FIELDS = graphql(`
  fragment ShortLinkStatsFields on ShortLinkStats @_unmask {
    total
    qr
    direct
    byDay {
      key
      count
      qrCount
    }
    byCountry {
      key
      count
      qrCount
    }
    byDeviceClass {
      key
      count
      qrCount
    }
    byPlacement {
      key
      count
      qrCount
    }
    byReferrerHost {
      key
      count
      qrCount
    }
  }
`)
