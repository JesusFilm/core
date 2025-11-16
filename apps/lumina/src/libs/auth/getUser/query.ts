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
