import { QueryResult, gql, useQuery } from '@apollo/client'
import { useState } from 'react'

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

export type ChildTag = Tag & { parentId: string }

export function useTagsQuery(): QueryResult<GetTags> & {
  parentTags: Tag[]
  childTags: ChildTag[]
} {
  const [parentTags, setParentTags] = useState<Tag[]>([])
  const [childTags, setChildTags] = useState<ChildTag[]>([])
  const query = useQuery<GetTags>(GET_TAGS, {
    onCompleted(data) {
      const parentTags: Tag[] = []
      const childTags: ChildTag[] = []
      data.tags.forEach((tag) => {
        if (tag.parentId == null) {
          parentTags.push(tag)
        } else {
          childTags.push(tag as ChildTag)
        }
      })
      setParentTags(parentTags)
      setChildTags(childTags)
    }
  })

  return {
    ...query,
    parentTags,
    childTags
  }
}
