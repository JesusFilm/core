import { useQuery } from '@apollo/client/react'

import { graphql } from '@core/shared/gql'

import { ShortLinkAccess, getShortLinkAccess } from '../access'

export const GET_SHORT_LINK_ACCESS = graphql(`
  query GetShortLinkAccess {
    me {
      id
      __typename
      ... on AuthenticatedUser {
        mediaUserRoles
      }
    }
  }
`)

export interface UseShortLinkAccessResult extends ShortLinkAccess {
  loading: boolean
}

export function useShortLinkAccess(): UseShortLinkAccessResult {
  const { data, loading } = useQuery(GET_SHORT_LINK_ACCESS)
  const roles =
    data?.me?.__typename === 'AuthenticatedUser' ? data.me.mediaUserRoles : []

  return { ...getShortLinkAccess(roles), loading }
}
