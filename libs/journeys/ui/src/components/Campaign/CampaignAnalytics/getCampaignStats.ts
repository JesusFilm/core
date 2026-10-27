import { gql } from '@apollo/client'

/**
 * One query for the whole section: every tab switches client-side over the
 * `all` and per-region scopes it returns, so the public page and the editor
 * canvas read the same cached sweep.
 */
export const GET_CAMPAIGN_STATS = gql`
  query GetCampaignStats($id: ID!) {
    campaignStats(id: $id) {
      from
      to
      all {
        totalVisitors
        countries {
          countryCode
          visitors
        }
      }
      regions {
        regionId
        totalVisitors
        countries {
          countryCode
          visitors
        }
      }
    }
  }
`
