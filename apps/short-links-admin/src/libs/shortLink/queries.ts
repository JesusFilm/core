import { graphql } from '@core/shared/gql'

import {
  SHORT_LINK_CAMPAIGN_FIELDS,
  SHORT_LINK_DOMAIN_FIELDS
} from './fragments'

export const GET_SHORT_LINK_DOMAINS = graphql(
  `
    query GetShortLinkDomains {
      shortLinkDomains(first: 100) {
        edges {
          node {
            ...ShortLinkDomainFields
          }
        }
      }
    }
  `,
  [SHORT_LINK_DOMAIN_FIELDS]
)

export const GET_SHORT_LINK_CAMPAIGN_OPTIONS = graphql(
  `
    query GetShortLinkCampaignOptions($search: String) {
      shortLinkCampaigns(search: $search, first: 100) {
        edges {
          node {
            ...ShortLinkCampaignFields
          }
        }
      }
    }
  `,
  [SHORT_LINK_CAMPAIGN_FIELDS]
)
