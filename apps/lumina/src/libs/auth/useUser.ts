'use client'

import { type QueryResult, useQuery } from '@apollo/client'

import { type ResultOf, graphql } from '@core/shared/gql'

export const ME_QUERY = graphql(`
  query Me {
    me {
      id
      email
      firstName
      lastName
      imageUrl
      emailVerified
    }
  }
`)

export type User = NonNullable<ResultOf<typeof ME_QUERY>['me']>

export function useUser(): QueryResult<ResultOf<typeof ME_QUERY>> & {
  user: User | undefined
} {
  const query = useQuery(ME_QUERY)
  return { ...query, user: query.data?.me ?? undefined }
}
