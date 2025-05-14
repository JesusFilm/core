import { gql, useLazyQuery } from '@apollo/client'
import { useEffect } from 'react'

import {
  GetVideoChildren,
  GetVideoChildren_video_children
} from '../../../__generated__/GetVideoChildren'
import { getUiLanguageId } from '../getUiLanguageId'
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

export function useVideoChildren(slug?: string): {
  loading: boolean
  children: GetVideoChildren_video_children[]
} {
  const [getVideoChildren, { loading, data }] =
    useLazyQuery<GetVideoChildren>(GET_VIDEO_CHILDREN)

  useEffect(() => {
    if (slug != null) {
      const languageSlug = slug.split('/').pop()
      const languageId = getUiLanguageId(languageSlug as any)

      void getVideoChildren({
        variables: { id: slug, languageId }
      })
    }
  }, [getVideoChildren, slug])

  return {
    loading,
    children: data?.video?.children != null ? data.video.children : []
  }
}
