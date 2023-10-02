import { QueryResult, gql, useQuery } from '@apollo/client'

import { GetTags } from '../../../__generated__/GetTags'

export const GET_TAGS = gql`
  query GetTags {
    tags {
      id
      name {
        value
        primary
      }
    }
  }
`

export function useTagsQuery(): QueryResult<GetTags> {
  const query = useQuery<GetTags>(GET_TAGS)

  return query
}
