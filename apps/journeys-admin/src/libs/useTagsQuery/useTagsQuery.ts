import { QueryResult, gql, useQuery } from '@apollo/client'
import { useMemo } from 'react'

import { GetTags, GetTags_tags as Tags } from '../../../__generated__/GetTags'

export const GET_TAGS = gql`
  query GetTags {
    tags {
      id
      service
      parentId
      name {
        value
        primary
        language {
          id
        }
      }
    }
  }
`

export function useTagsQuery(): QueryResult<GetTags> & {
  parentTags?: Tags[]
  childTags?: Tags[]
} {
  const query = useQuery<GetTags>(GET_TAGS)

  const parentTags = useMemo(() => {
    return query.data?.tags?.filter((tag) => tag.parentId === null)
  }, [query])

  const childTags = useMemo(() => {
    return query.data?.tags?.filter((tag) => tag.parentId !== null)
  }, [query])

  return {
    ...query,
    parentTags,
    childTags
  }
}
