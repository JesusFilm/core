import { gql, useQuery } from '@apollo/client'
import { useMemo } from 'react'

import {
  GetVideoChildren,
  GetVideoChildren_video_children
} from '../../../__generated__/GetVideoChildren'
import { getLanguageIdFromLocale } from '../getLanguageIdFromLocale'
import { VIDEO_CHILD_FIELDS } from '../videoChildFields'

export const GET_VIDEO_CHILDREN = gql`
  ${VIDEO_CHILD_FIELDS}
  query GetVideoChildren($id: ID!, $languageId: ID) {
    video(id: $id, idType: slug) {
      id
      children {
        ...VideoChildFields
      }
    }
  }
`

export function useVideoChildren(
  slug?: string,
  locale?: string
): {
  loading: boolean
  children: GetVideoChildren_video_children[]
} {
  const { loading, data } = useQuery<GetVideoChildren>(GET_VIDEO_CHILDREN, {
    skip: slug == null,
    variables: { id: slug!, languageId: getLanguageIdFromLocale(locale) },
    // variant children are not cached properly
    fetchPolicy: 'no-cache'
  })

  const children = useMemo(() => {
    return data?.video?.children != null
      ? data.video.children.filter((child) => child.variant != null)
      : []
  }, [data])

  return {
    loading,
    children
  }
}
