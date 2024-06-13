import { QueryResult, gql, useQuery } from '@apollo/client'
import { useMemo } from 'react'

import { GetTags, GetTags_tags as Tag } from '../../../__generated__/GetTags'

export const GET_TAGS = gql`
  query GetTags {
    tags {
      id
      service
      parentId
      name {
        value
        primary
      }
    }
  }
`

type ChildTag = Tag & { parentId: string }

export function useTagsQuery(): QueryResult<GetTags> & {
  parentTags: Tag[]
  childTags: ChildTag[]
} {
  const query = useQuery<GetTags>(GET_TAGS)
  const [parentTags, childTags] = useMemo(() => {
    const parentTags: Tag[] = []
    const childTags: ChildTag[] = []
    if (query.data == null) {
      return [parentTags, childTags]
    } else {
      query.data.tags.forEach((tag) => {
        if (tag.parentId == null) {
          parentTags.push(tag)
        } else {
          childTags.push(tag as ChildTag)
        }
      })
      return [parentTags, childTags]
    }
  }, [query.data])

  return {
    ...query,
    parentTags,
    childTags
  }
}
