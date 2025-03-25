import { QueryHookOptions, QueryResult, gql, useQuery } from '@apollo/client'

// Temporary type definitions to work around the missing generated types
interface CustomDomain {
  __typename: 'CustomDomain'
  id: string
  name: string
  apexName: string
  routeAllTeamJourneys: boolean
}

interface Team {
  __typename: 'Team'
  id: string
  customDomains: CustomDomain[] | null
}

interface JourneyData {
  __typename: 'Journey'
  id: string
  slug: string | null
  title: string
  team: Team | null
}

interface ShortLinkDomain {
  __typename: 'ShortLinkDomain'
  hostname: string
}

interface ShortLink {
  __typename: 'ShortLink'
  id: string
  pathname: string
  domain: ShortLinkDomain
  to: string
}

interface QrCode {
  __typename: 'QrCode'
  id: string
  toJourneyId: string | null
  shortLink: ShortLink
}

interface ShareDataQuery {
  journey: JourneyData
  qrCodes: QrCode[]
}

interface QrCodesFilter {
  journeyId?: string | null
}

interface ShareDataQueryVariables {
  id: string
  qrCodeWhere?: QrCodesFilter | null
}

export const SHARE_DATA_QUERY = gql`
  query ShareDataQuery($id: ID!, $qrCodeWhere: QrCodesFilter!) {
    journey(id: $id) {
      id
      slug
      title
      team {
        id
        customDomains {
          id
          name
          apexName
          routeAllTeamJourneys
        }
      }
    }
    qrCodes(where: $qrCodeWhere) {
      id
      toJourneyId
      shortLink {
        id
        pathname
        to
        domain {
          hostname
        }
      }
    }
  }
`

export function useShareDataQuery(
  options?: QueryHookOptions<ShareDataQuery, ShareDataQueryVariables>
): QueryResult<ShareDataQuery, ShareDataQueryVariables> {
  const query = useQuery<ShareDataQuery, ShareDataQueryVariables>(
    SHARE_DATA_QUERY,
    options
  )

  return query
}
