import { graphql } from 'gql.tada'

export const GET_SHORT_LINK_QUERY = graphql(`
  query GetShortLinkQuery($hostname: String!, $pathname: String!) {
    shortLink: shortLinkByPath(hostname: $hostname, pathname: $pathname) {
      __typename
      ... on QueryShortLinkByPathSuccess {
        data {
          to
        }
      }
    }
  }
`)
