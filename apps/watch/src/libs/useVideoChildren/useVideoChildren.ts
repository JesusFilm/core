import { gql, useLazyQuery } from '@apollo/client'
import { useEffect } from 'react'
import {
  GetVideoChildren,
  GetVideoChildren_video_children
} from '../../../__generated__/GetVideoChildren'
import { VIDEO_CHILD_FIELDS } from '../videoChildFields'

export const GET_VIDEO_CHILDREN = gql`
  ${VIDEO_CHILD_FIELDS}
  query GetVideoChildren($id: ID!, $languageId: ID) {
    video(id: $id) {
      id
      children {
        ...VideoChildFields
      }
    }
  }
`

export function useVideoChildren(id?: string): {
  loading: boolean
  children: GetVideoChildren_video_children[]
} {
  const [getVideoChildren, { loading, data }] =
    useLazyQuery<GetVideoChildren>(GET_VIDEO_CHILDREN)

  useEffect(() => {
    if (id != null) {
      void getVideoChildren({
        variables: { id }
      })
    }
  }, [getVideoChildren, id])

  return {
    loading,
    children:
      data?.video != null && data.video.id === id ? data.video.children : []
  }
}
