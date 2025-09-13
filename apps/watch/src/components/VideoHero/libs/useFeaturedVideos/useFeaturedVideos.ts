import { gql, useQuery } from '@apollo/client'
import { useMemo } from 'react'

import {
  GetVideoChildren,
  GetVideoChildren_video_children
} from '../../../../../__generated__/GetVideoChildren'
import { getLanguageIdFromLocale } from '../../../../libs/getLanguageIdFromLocale'
import { VIDEO_CONTENT_FIELDS } from '../../../../libs/videoContentFields'
//TODO: check if this is the correct way to use gql
export const GET_FEATURED_VIDEOS = gql`
  ${VIDEO_CONTENT_FIELDS}
  query GetFeaturedVideos($languageId: ID) {
    video(id: "new-believer-course/english", idType: slug) {
      id
      children {
        ...VideoContentFields
      }
    }
  }
`

export function useFeaturedVideos(locale?: string): {
  loading: boolean
  videos: GetVideoChildren_video_children[]
} {
  const { loading, data } = useQuery<GetVideoChildren>(GET_FEATURED_VIDEOS, {
    variables: { languageId: getLanguageIdFromLocale(locale) },
    // Use cache-and-network for better UX - field policy for Video.children should be configured in Apollo Client
    fetchPolicy: 'cache-and-network'
  })

  const videos = useMemo(() => {
    if (data?.video?.children == null) return []
    return data.video.children.filter((child) => child.variant != null)
  }, [data])

  return {
    loading,
    videos
  }
}
